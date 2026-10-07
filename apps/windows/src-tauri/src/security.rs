use std::path::{Path, PathBuf};

pub struct Security;

impl Security {
    /// Sanitizes and resolves a requested relative path against a base shared directory.
    /// Ensures that the resolved path stays strictly within the base folder boundary.
    pub fn sanitize_path(base_dir: &Path, requested: &str) -> Result<PathBuf, String> {
        // Strip leading slashes, backslashes, and drive prefixes
        let cleaned = requested
            .trim_start_matches(|c| c == '/' || c == '\\')
            .replace('\\', "/");

        // Prevent obvious directory traversal patterns
        for component in cleaned.split('/') {
            if component == ".." {
                return Err("Path traversal attempt blocked ('..')".to_string());
            }
        }

        let target = base_dir.join(cleaned);

        // If target exists, canonicalize both and check prefix
        if target.exists() {
            let canon_base = base_dir
                .canonicalize()
                .map_err(|e| format!("Failed to canonicalize base: {}", e))?;
            let canon_target = target
                .canonicalize()
                .map_err(|e| format!("Failed to canonicalize target: {}", e))?;

            if !canon_target.starts_with(&canon_base) {
                return Err("Access denied: path escapes shared root boundary".to_string());
            }
            return Ok(canon_target);
        }

        // For non-existent paths (e.g. upload destination), verify parent directory
        if let Some(parent) = target.parent() {
            if parent.exists() {
                let canon_base = base_dir
                    .canonicalize()
                    .map_err(|e| format!("Failed to canonicalize base: {}", e))?;
                let canon_parent = parent
                    .canonicalize()
                    .map_err(|e| format!("Failed to canonicalize parent: {}", e))?;

                if !canon_parent.starts_with(&canon_base) {
                    return Err("Access denied: target path escapes shared root".to_string());
                }
            }
        }

        Ok(target)
    }

    /// Validates filename for safety on Windows filesystems
    pub fn is_safe_filename(name: &str) -> bool {
        if name.is_empty() || name.len() > 255 {
            return false;
        }
        let invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
        if name.chars().any(|c| invalid_chars.contains(&c)) {
            return false;
        }
        let reserved = [
            "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7",
            "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8",
            "LPT9",
        ];
        let upper = name.to_uppercase();
        let stem = upper.split('.').next().unwrap_or("");
        !reserved.contains(&stem)
    }
}
