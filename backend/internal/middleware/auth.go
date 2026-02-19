package middleware

import (
	"log"
	"net/http"
	"strings"

	"log_book/internal/models"
	"log_book/internal/repository"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwks"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
)

const (
	ContextKeyClerkID = "clerk_id"
	ContextKeyUserID  = "user_id"
)

func AuthMiddleware(userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Authorization header required",
				nil,
			))
			c.Abort()
			return
		}

		// Extract Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Invalid authorization header format",
				nil,
			))
			c.Abort()
			return
		}

		token := parts[1]

		// Decode token to get the key ID (kid)
		unsafeClaims, err := jwt.Decode(c.Request.Context(), &jwt.DecodeParams{
			Token: token,
		})
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Invalid token format",
				nil,
			))
			c.Abort()
			return
		}

		// Fetch JWKS from Clerk
		jwkSet, err := jwks.Get(c.Request.Context(), &jwks.GetParams{})
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Failed to verify token",
				nil,
			))
			c.Abort()
			return
		}

		// Find the correct key from the set
		var jwk *clerk.JSONWebKey
		for _, key := range jwkSet.Keys {
			if key.KeyID == unsafeClaims.KeyID {
				jwk = key
				break
			}
		}
		if jwk == nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Token signing key not found",
				nil,
			))
			c.Abort()
			return
		}

		// Verify JWT with Clerk using the fetched JWK
		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token: token,
			JWK:   jwk,
		})
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Invalid or expired token",
				nil,
			))
			c.Abort()
			return
		}

		// Sync user data
		var email, name string

		// Fetch user from Clerk API
		u, err := user.Get(c.Request.Context(), claims.Subject)
		if err == nil && u != nil {
			// Extract primary email
			if len(u.EmailAddresses) > 0 {
				email = u.EmailAddresses[0].EmailAddress
			}
			if u.FirstName != nil {
				name = *u.FirstName
				if u.LastName != nil {
					name += " " + *u.LastName
				}
			}
		} else {
			log.Printf("Failed to fetch user from Clerk: %v", err)
		}

		// Ensure user exists and is up to date
		if _, err := userRepo.SyncUser(c.Request.Context(), claims.Subject, email, name); err != nil {
			log.Printf("Failed to sync user: %v", err)
		}

		// Set clerk_id in context
		c.Set(ContextKeyClerkID, claims.Subject)
		c.Next()
	}
}

// AdminMiddleware ensures the user has admin role
func AdminMiddleware(userRepo *repository.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		clerkID := GetClerkID(c)
		if clerkID == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"User not authenticated",
				nil,
			))
			c.Abort()
			return
		}

		user, err := userRepo.GetByClerkID(c.Request.Context(), clerkID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to fetch user profile",
				nil,
			))
			c.Abort()
			return
		}

		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"Admin access required",
				nil,
			))
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetClerkID retrieves the Clerk user ID from context
func GetClerkID(c *gin.Context) string {
	if clerkID, exists := c.Get(ContextKeyClerkID); exists {
		return clerkID.(string)
	}
	return ""
}

// GetUserID retrieves the internal user ID from context
func GetUserID(c *gin.Context) string {
	if userID, exists := c.Get(ContextKeyUserID); exists {
		return userID.(string)
	}
	return ""
}

// InitClerk initializes the Clerk SDK with the secret key
func InitClerk(secretKey string) {
	if secretKey == "" {
		log.Println("WARNING: CLERK_SECRET_KEY is not set")
	}
	clerk.SetKey(secretKey)
}
