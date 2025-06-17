import React, { useState } from "react";

import styles from "./PeriodPriceForm.module.css";
import { DateFormatter } from "./PeriodPriceChartModel";
import { PERIOD_OPTIONS, PeriodPriceRequest } from "@/types/stock/price";

interface PeriodPriceFormProps {
  initialData: PeriodPriceRequest;
  loading: boolean;
  onSubmit: (data: PeriodPriceRequest) => Promise<void>;
}

export const PeriodPriceForm: React.FC<PeriodPriceFormProps> = ({
  initialData,
  loading,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PeriodPriceRequest>(initialData);

  const handleInputChange = (
    field: keyof PeriodPriceRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>기간구분</label>
          <select
            value={formData.periodDivCode}
            onChange={(e) => handleInputChange("periodDivCode", e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>시작일</label>
          <input
            type="date"
            value={DateFormatter.forInput(formData.startDate)}
            onChange={(e) =>
              handleInputChange(
                "startDate",
                DateFormatter.fromInput(e.target.value)
              )
            }
            className={styles.dateInput}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>종료일</label>
          <input
            type="date"
            value={DateFormatter.forInput(formData.endDate)}
            onChange={(e) =>
              handleInputChange(
                "endDate",
                DateFormatter.fromInput(e.target.value)
              )
            }
            className={styles.dateInput}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>수정주가</label>
          <select
            value={formData.orgAdjPrc}
            onChange={(e) => handleInputChange("orgAdjPrc", e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="0">수정주가</option>
            <option value="1">원주가</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "조회중..." : "조회"}
        </button>
      </div>
    </form>
  );
};
