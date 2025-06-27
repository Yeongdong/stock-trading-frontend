import React, { useState, useCallback, useEffect } from "react";
import {
  OverseasPeriodPriceRequest,
  OVERSEAS_PERIOD_OPTIONS,
} from "@/types/domains/stock/overseas";
import styles from "./OverseasPeriodPriceForm.module.css";
import { OverseasDateFormatter } from "@/utils/OverseasDateFormatter";

interface OverseasPeriodPriceFormProps {
  initialData: OverseasPeriodPriceRequest;
  loading: boolean;
  onSubmit: (data: OverseasPeriodPriceRequest) => Promise<void>;
}

export const OverseasPeriodPriceForm: React.FC<
  OverseasPeriodPriceFormProps
> = ({ initialData, loading, onSubmit }) => {
  const [formData, setFormData] =
    useState<OverseasPeriodPriceRequest>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (
    field: keyof OverseasPeriodPriceRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(formData);
    },
    [formData, onSubmit]
  );

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
            {OVERSEAS_PERIOD_OPTIONS.map((option) => (
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
            value={OverseasDateFormatter.forInput(formData.startDate)}
            onChange={(e) =>
              handleInputChange(
                "startDate",
                OverseasDateFormatter.fromInput(e.target.value)
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
            value={OverseasDateFormatter.forInput(formData.endDate)}
            onChange={(e) =>
              handleInputChange(
                "endDate",
                OverseasDateFormatter.fromInput(e.target.value)
              )
            }
            className={styles.dateInput}
            disabled={loading}
            required
          />
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
