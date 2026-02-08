use anyhow::Result;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::path::Path;

#[derive(Serialize, Deserialize, Default)]
pub struct Manifest {
    pub files: HashMap<String, String>,
}

impl Manifest {
    pub fn load(dist_dir: &Path) -> Result<Self> {
        let path = dist_dir.join(".manifest.json");
        if path.exists() {
            let content = std::fs::read_to_string(&path)?;
            Ok(serde_json::from_str(&content)?)
        } else {
            Ok(Self::default())
        }
    }

    pub fn save(&self, dist_dir: &Path) -> Result<()> {
        let path = dist_dir.join(".manifest.json");
        let content = serde_json::to_string_pretty(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }

    pub fn record(&mut self, key: &str, content: &[u8]) {
        let hash = hex_sha256(content);
        self.files.insert(key.to_string(), hash);
    }
}

fn hex_sha256(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    format!("{:x}", hasher.finalize())
}
