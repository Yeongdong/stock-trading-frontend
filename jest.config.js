/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    // CSS 파일을 목 처리
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // 이미지, 폰트 등 다른 정적 파일 목 처리
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    // 경로 별칭 처리 (@/ -> src/)
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  // 필요한 경우 transform에서 node_modules 특정 패키지 제외하기
  transformIgnorePatterns: ["/node_modules/(?!(nanoid|other-esm-package)/)"],
};

module.exports = config;
