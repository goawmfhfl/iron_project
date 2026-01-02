"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AdminUser, UpdateUserInput, Gender, UserRole } from "@/lib/types/user";

interface UserDetailFormProps {
  user: AdminUser;
  onSubmit: (data: UpdateUserInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserDetailForm({
  user,
  onSubmit,
  isLoading = false,
}: UserDetailFormProps) {
  const [formData, setFormData] = useState({
    email: user.email,
    phone: user.phone || "",
    gender: (user.gender as Gender) || "",
    nickname: user.nickname || "",
    user_role: user.user_role,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      email: user.email,
      phone: user.phone || "",
      gender: (user.gender as Gender) || "",
      nickname: user.nickname || "",
      user_role: user.user_role,
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 에러 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "올바른 이메일 형식이 아닙니다.";
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
      const cleanedPhone = formData.phone.replace(/-/g, "");
      if (!phoneRegex.test(formData.phone) && cleanedPhone.length !== 11) {
        newErrors.phone = "올바른 전화번호 형식이 아닙니다.";
      }
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData: UpdateUserInput = {
      email: formData.email !== user.email ? formData.email : undefined,
      phone: formData.phone !== (user.phone || "") ? formData.phone : undefined,
      gender:
        formData.gender !== (user.gender || "")
          ? (formData.gender as Gender)
          : undefined,
      nickname:
        formData.nickname !== (user.nickname || "")
          ? formData.nickname
          : undefined,
      user_role:
        formData.user_role !== user.user_role
          ? formData.user_role
          : undefined,
    };

    // 변경된 필드만 전송
    const hasChanges = Object.values(updateData).some(
      (value) => value !== undefined
    );

    if (!hasChanges) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    await onSubmit(updateData);
  };

  const genderOptions = [
    { value: "남성", label: "남성" },
    { value: "여성", label: "여성" },
    { value: "기타", label: "기타" },
  ];

  const roleOptions = [
    { value: "user", label: "일반 회원" },
    { value: "premium_user", label: "프리미엄 회원" },
    { value: "admin", label: "관리자" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="example@email.com"
        />

        <Input
          label="닉네임"
          name="nickname"
          type="text"
          value={formData.nickname}
          onChange={handleChange}
          error={errors.nickname}
          required
          placeholder="닉네임을 입력하세요"
        />

        <Input
          label="전화번호"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="010-1234-5678"
        />

        <Select
          label="성별"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          error={errors.gender}
          options={genderOptions}
          required
        />

        <Select
          label="역할"
          name="user_role"
          value={formData.user_role}
          onChange={handleChange}
          options={roleOptions}
          required
        />
      </div>

      <div className="pt-4 border-t border-surface-elevated">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">가입일:</span>{" "}
            <span className="text-text-primary">
              {new Date(user.created_at).toLocaleString("ko-KR")}
            </span>
          </div>
          {user.last_sign_in_at && (
            <div>
              <span className="text-text-secondary">마지막 로그인:</span>{" "}
              <span className="text-text-primary">
                {new Date(user.last_sign_in_at).toLocaleString("ko-KR")}
              </span>
            </div>
          )}
          {user.confirmed_at && (
            <div>
              <span className="text-text-secondary">이메일 인증일:</span>{" "}
              <span className="text-text-primary">
                {new Date(user.confirmed_at).toLocaleString("ko-KR")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t border-surface-elevated">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}

