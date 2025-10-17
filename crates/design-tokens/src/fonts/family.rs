pub struct Family(pub &'static str);

impl Family {
    pub const fn new(name: &'static str) -> Self {
        Family(name)
    }

    pub const fn value(&self) -> &'static str {
        self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_family_name() {
        let family = Family::new("Arial");
        assert_eq!(family.value(), "Arial");
    }
}
