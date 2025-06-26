import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { AuthUser } from "@/types";
import styles from "./UserProfileContent.module.css";

interface UserProfileContentProps {
  user: AuthUser;
}

const UserProfileContent: React.FC<UserProfileContentProps> = ({ user }) => {
  const [showKisSecret, setShowKisSecret] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { addError } = useError();
  const router = useRouter();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "정보 없음";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const maskString = (value?: string) => {
    if (!value) return "설정되지 않음";
    if (value.length <= 8) return "*".repeat(value.length);
    return (
      value.substring(0, 4) +
      "*".repeat(value.length - 8) +
      value.substring(value.length - 4)
    );
  };

  const toggleKisSecretVisibility = () => {
    setShowKisSecret((prev) => !prev);
  };

  const handleEditApiInfo = () => {
    router.push("/kis-token");
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteLoading(true);

    const response = await apiClient.delete(API.USER.DELETE_ACCOUNT, {
      requiresAuth: true,
    });

    if (response.error) {
      addError({
        message: "회원 탈퇴 처리 중 오류가 발생했습니다.",
        severity: "error",
      });
      setIsDeleteLoading(false);
      setShowDeleteConfirm(false);
      return;
    }

    addError({
      message: "회원 탈퇴가 완료되었습니다.",
      severity: "info",
    });

    // 로그인 페이지로 리다이렉트
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.profileContent}>
      {/* 기본 정보 섹션 */}
      <div className={styles.sectionCard}>
        <h2>기본 정보</h2>
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <label>이름:</label>
            <span>{user.name || "정보 없음"}</span>
          </div>
          <div className={styles.infoItem}>
            <label>이메일:</label>
            <span>{user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <label>가입 날짜:</label>
            <span>{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* API 정보 섹션 */}
      <div className={styles.sectionCard}>
        <h2>API 정보</h2>
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <label>계좌번호:</label>
            <span className={styles.monospace}>
              {user.accountNumber || "설정되지 않음"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <label>KIS App Key:</label>
            <span className={styles.monospace}>
              {user.kisAppKey ? maskString(user.kisAppKey) : "설정되지 않음"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <label>KIS App Secret:</label>
            <span className={styles.monospace}>
              {!user.kisAppSecret
                ? "설정되지 않음"
                : showKisSecret
                ? user.kisAppSecret
                : "*".repeat(user.kisAppSecret.length)}
              {user.kisAppSecret && (
                <button
                  className={styles.toggleButton}
                  onClick={toggleKisSecretVisibility}
                >
                  {showKisSecret ? "숨기기" : "보기"}
                </button>
              )}
            </span>
          </div>
          <div className={styles.infoItem}>
            <label>WebSocket Token:</label>
            <span className={styles.monospace}>
              {user.webSocketToken
                ? maskString(user.webSocketToken)
                : "설정되지 않음"}
            </span>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className={styles.actionButtons}>
        <button className={styles.editButton} onClick={handleEditApiInfo}>
          API 정보 수정
        </button>

        {!showDeleteConfirm ? (
          <button
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            disabled={isDeleteLoading}
          >
            회원 탈퇴
          </button>
        ) : (
          <div className={styles.deleteConfirm}>
            <p>정말로 회원 탈퇴를 진행하시겠습니까?</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.cancelButton}
                onClick={handleDeleteCancel}
                disabled={isDeleteLoading}
              >
                취소
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleDeleteConfirm}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileContent;
