pub mod colors;
use colors::Color;

pub fn add(left: u64, right: u64) -> u64 {
    let a: Color = Color::new(0, 0, 0);
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
