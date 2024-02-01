const allTexts: string[] = [
  '아무말 빔----',
  '휴대폰용 보험은 가입하셨나요?',
];

const getRandomText = () => allTexts[Math.floor(Math.random() * allTexts.length)];

export const createGacha = () => {
  const result = getRandomText();
  return result;
};
