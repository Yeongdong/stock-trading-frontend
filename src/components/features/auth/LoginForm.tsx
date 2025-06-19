import { useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { useAuthContext } from "@/contexts/AuthContext";
import styles from "./LoginForm.module.css";
import { useLoginHandler } from "@/hooks/auth/useLoginHandler";
import { LoginFormProps } from "@/types/domains/auth/components";

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const { addError } = useError();
  const { checkAuth } = useAuthContext();
  const { handleGoogleLogin } = useLoginHandler();
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId)
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          Google 로그인이 설정되지 않았습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setIsLoading(true);

    try {
      const result = await handleGoogleLogin(credentialResponse);

      if (result.success && result.redirectTo) {
        await checkAuth();
        onLoginSuccess?.(result.redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    addError({
      message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      severity: "error",
    });
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className={styles.loginForm}>
        <div className={styles.header}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>
            Google 계정으로 간편하게 로그인하세요
          </p>
        </div>

        <div className={styles.loginSection}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>로그인 중...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
