-- Migration: 003_remove_versioning
-- Description: Remove document versioning, store content directly on documents table

-- Copy latest version content into documents table
ALTER TABLE documents ADD COLUMN content JSONB;

UPDATE documents d
SET content = (
    SELECT dv.content
    FROM document_versions dv
    WHERE dv.document_id = d.id
    AND dv.version_number = d.current_version
);

-- Drop versioning infrastructure
DROP TABLE document_versions;
ALTER TABLE documents DROP COLUMN current_version;
