const standard = { length: 8, groups: 3 };
const extended = { length: 12, groups: 2 };
const predictable =
  /^(?:password|qwerty|123456|matkhau|mậtkhẩu)|^(.{1,4})\1+$/iu;

export const MIN_STRONG_PASSWORD_LENGTH = standard.length;

type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export function assessPassword(value: string) {
  const password = value.trim();
  const length = Array.from(password).length;
  const characterGroups = {
    lowercase: /\p{Ll}/u.test(password),
    uppercase: /\p{Lu}/u.test(password),
    digit: /\p{N}/u.test(password),
    symbol: /[\p{P}\p{S}]/u.test(password),
  };
  const groupCount = Object.values(characterGroups).filter(Boolean).length;
  const requiredGroups =
    length >= extended.length ? extended.groups : standard.groups;
  const meetsLength = length >= MIN_STRONG_PASSWORD_LENGTH;
  const meetsGroups = groupCount >= requiredGroups;
  const avoidsPredictablePattern = length > 0 && !predictable.test(password);

  let level: PasswordStrength = value ? "weak" : "empty";
  if (length >= 8 && avoidsPredictablePattern) {
    if (meetsLength && meetsGroups) {
      level = "strong";
    } else if (meetsLength || groupCount >= 2) {
      level = "medium";
    }
  }

  return {
    level,
    characterGroups,
    requiredGroups,
    meetsLength,
    meetsGroups,
    avoidsPredictablePattern,
  };
}

export function isStrongPassword(password: string) {
  return assessPassword(password).level === "strong";
}
