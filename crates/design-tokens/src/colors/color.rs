use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct Color {
    pub red: u8,
    pub green: u8,
    pub blue: u8,
}

impl Color {
    pub const fn new(red: u8, green: u8, blue: u8) -> Self {
        Self { red, green, blue }
    }
    
    pub fn validate(&self) -> bool {
        true
    }
}

impl<'de> Deserialize<'de> for Color {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let rgb = Vec::<u8>::deserialize(deserializer)?;
        
        if rgb.len() != 3 {
            return Err(serde::de::Error::custom(
                format!("Expected array of 3 elements, got {}", rgb.len())
            ));
        }
        
        Ok(Color::new(rgb[0], rgb[1], rgb[2]))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_color_to_hex() {
        let color = Color::new(255, 0, 0);
        assert_eq!(color.red, 255);
        assert_eq!(color.green, 0);
        assert_eq!(color.blue, 0);
    }
    
    #[test]
    fn test_color_deserialize_from_array() {
        let json = "[255, 128, 64]";
        let color: Color = serde_json::from_str(json).unwrap();
        assert_eq!(color.red, 255);
        assert_eq!(color.green, 128);
        assert_eq!(color.blue, 64);
    }
    
    #[test]
    fn test_color_deserialize_invalid_length() {
        let json = "[255, 128]";
        let result: Result<Color, _> = serde_json::from_str(json);
        assert!(result.is_err());
    }
}