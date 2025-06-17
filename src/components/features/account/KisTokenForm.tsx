import { useRef, useState } from "react";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import styles from "./KisTokenForm.module.css";
import { KisTokenFormProps } from "@/types/components/account";
import { UserInfoRequest } from "@/types/api/user";

const KisTokenForm = ({ userId }: KisTokenFormProps) => {
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAppSecret, SetShowAppSecret] = useState<boolean>(false);
  const appSecretRef = useRef<HTMLInputElement>(null);
  const { addError } = useError();

  const toggleAppSecretVisibility = () => {
    SetShowAppSecret((prev) => !prev);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addError({
          message: "클립보드에 복사되었습니다.",
          severity: "info",
        });
      })
      .catch(() => {
        addError({
          message: "클립보드 복사에 실패했습니다.",
          severity: "error",
        });
      });
  };

  const validateForm = () => {
    if (!appKey.trim()) {
      addError({
        message: ERROR_MESSAGES.KIS_TOKEN.REQUIRED_APP_KEY,
        severity: "warning",
      });
      return false;
    }

    if (!appSecret.trim()) {
      addError({
        message: ERROR_MESSAGES.KIS_TOKEN.REQUIRED_APP_SECRET,
        severity: "warning",
      });
      return false;
    }

    if (!accountNumber.trim()) {
      addError({
        message: ERROR_MESSAGES.KIS_TOKEN.REQUIRED_ACCOUNT,
        severity: "warning",
      });
      return false;
    }
    return true;
  };

  const handleGetKisToken = async () => {
    if (!validateForm() || !userId) return;

    try {
      setIsLoading(true);

      const requestData: UserInfoRequest = {
        appKey,
        appSecret,
        accountNumber,
      };

      const response = await apiClient.post(API.USER.USER_INFO, requestData);

      if (response.error) {
        throw new Error(response.error);
      }

      addError({
        message: ERROR_MESSAGES.KIS_TOKEN.TOKEN_SUCCESS,
        severity: "info",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Error getting KIS token:", error);
      addError({
        message: ERROR_MESSAGES.KIS_TOKEN.TOKEN_FAIL,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.kisTokenForm}>
      <h1>한국투자증권 API 정보 설정</h1>
      <p>실시간 주식 거래를 위해 한국투자증권 API 정보를 입력해주세요.</p>

      <div className={styles.formGroup}>
        <label htmlFor="appKey">API Key:</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="appKey"
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />
          {appKey && (
            <button
              type="button"
              className={styles.copyButton}
              onClick={() => copyToClipboard(appKey)}
              aria-label="Copy API Key"
            >
              복사
            </button>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="appSecret">API Secret:</label>
        <div className={styles.inputWrapper}>
          <input
            type={showAppSecret ? "text" : "password"}
            id="appSecret"
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
            ref={appSecretRef}
          />
          <button
            type="button"
            className={styles.toggleVisibility}
            onClick={toggleAppSecretVisibility}
            aria-label={showAppSecret ? "Hide secret" : "Show secret"}
          >
            {showAppSecret ? "숨기기" : "보기"}
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="accountNumber">계좌번호:</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      <button
        onClick={handleGetKisToken}
        disabled={isLoading}
        className={styles.btn}
      >
        {isLoading ? "처리 중..." : "토큰 발급받기"}
      </button>

      <div className={styles.helpText}>
        <p>
          * API 키와 시크릿은 한국투자증권 개발자 센터에서 발급받으실 수
          있습니다.
        </p>
        <p>* 계좌번호는 숫자만 입력해주세요 (예: 5012345678).</p>
      </div>

      <div className={styles.securityInfo}>
        <h3>보안 정보</h3>
        <ul>
          <li>입력하신 정보는 서버에 안전하게 암호화되어 저장됩니다.</li>
          <li>API 시크릿은 암호화되어 전송되며, 서버에서만 접근 가능합니다.</li>
          <li>브라우저 기록에 민감 정보가 남지 않도록 주의하세요.</li>
        </ul>
      </div>
    </div>
  );
};

export default KisTokenForm;
