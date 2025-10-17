#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Px(f32);

impl Px {
    pub const fn new(value: f32) -> Self {
        Self(value)
    }

    pub const fn value(self) -> f32 {
        self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_px_value() {
        let size = Px::new(16.0);
        assert_eq!(size.value(), 16.0);
    }
}