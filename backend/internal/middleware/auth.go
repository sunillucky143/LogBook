package middleware

import (
	"net/http"
	"strings"

	"log_book/internal/models"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwks"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
)

const (
	ContextKeyClerkID = "clerk_id"
	ContextKeyUserID  = "user_id"
)

func AuthMiddleware() gin.HandlerFunc {
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
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
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
			println("[AUTH DEBUG] Failed to decode token:", err.Error())
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
			println("[AUTH DEBUG] Failed to fetch JWKS:", err.Error())
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
			println("[AUTH DEBUG] No matching JWK found for kid:", unsafeClaims.KeyID)
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
			println("[AUTH DEBUG] Token verification failed:", err.Error())
			c.JSON(http.StatusUnauthorized, models.ErrorResponse(
				models.ErrCodeUnauthorized,
				"Invalid or expired token",
				nil,
			))
			c.Abort()
			return
		}

		// Set clerk_id in context
		c.Set(ContextKeyClerkID, claims.Subject)
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
		println("[AUTH DEBUG] WARNING: CLERK_SECRET_KEY is empty!")
	} else {
		println("[AUTH DEBUG] Clerk initialized with key:", secretKey[:15]+"...")
	}
	clerk.SetKey(secretKey)
}
