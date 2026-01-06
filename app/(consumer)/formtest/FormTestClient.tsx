"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { FormDatabaseType } from "@/lib/types/notion-form";

interface NotionProperty {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface RawNotionDatabase {
  id: string;
  properties: Record<string, NotionProperty>;
  [key: string]: any;
}

interface ParsedField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  isLongText?: boolean;
  maxSelections?: number;
  order?: number;
}

interface FormSchemaResponse {
  databaseId: string;
  fields: ParsedField[];
  submitUrl: string;
  coverImage?: string | null;
}

export function FormTestClient() {
  const [formType, setFormType] = useState<FormDatabaseType>("DORAN_BOOK");
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<RawNotionDatabase | null>(null);
  const [parsedSchema, setParsedSchema] = useState<FormSchemaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFormData = async () => {
    setLoading(true);
    setError(null);
    setRawData(null);
    setParsedSchema(null);

    try {
      // 1. 원본 Notion 데이터베이스 조회
      const rawRes = await fetch(`/api/formtest/raw?type=${formType}`);
      if (!rawRes.ok) {
        throw new Error("원본 데이터 조회 실패");
      }
      const raw = await rawRes.json();
      setRawData(raw.database);

      // 2. 파싱된 폼 스키마 조회
      const schemaRes = await fetch(`/api/socialing/form-schema?type=${formType}`);
      if (!schemaRes.ok) {
        throw new Error("파싱된 스키마 조회 실패");
      }
      const schemaData = await schemaRes.json();
      setParsedSchema(schemaData.schema);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, [formType]);

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      title: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      rich_text: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      email: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      phone_number: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      number: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      select: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      multi_select: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      date: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      checkbox: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      url: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      files: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const isSupportedType = (type: string): boolean => {
    const supported = [
      "title",
      "rich_text",
      "number",
      "select",
      "multi_select",
      "date",
      "checkbox",
      "url",
      "email",
      "phone_number",
      "files",
    ];
    return supported.includes(type);
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 */}
      <Card elevation={1}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">설정</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              label="폼 타입"
              value={formType}
              onChange={(e) => setFormType(e.target.value as FormDatabaseType)}
              options={[
                { value: "DORAN_BOOK", label: "도란책방" },
                { value: "EVENT", label: "이벤트" },
                { value: "VIVID", label: "비비드" },
              ]}
            />
            <div className="flex-1" />
            <Button onClick={fetchFormData} disabled={loading}>
              {loading ? "로딩 중..." : "새로고침"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary">데이터를 불러오는 중...</p>
          </CardContent>
        </Card>
      )}

      {rawData && parsedSchema && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 원본 Notion 속성 */}
          <Card elevation={1}>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                원본 Notion 속성 ({Object.keys(rawData.properties || {}).length}개)
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(rawData.properties || {}).map(([key, prop]: [string, any]) => {
                  const supported = isSupportedType(prop.type);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${
                        supported
                          ? "border-primary-300 bg-primary-50/50 dark:bg-primary-900/10"
                          : "border-gray-300 bg-gray-50 dark:bg-gray-900/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">{prop.name || key}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getPropertyTypeColor(
                                prop.type
                              )}`}
                            >
                              {prop.type}
                            </span>
                            {!supported && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                필터됨
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-tertiary font-mono">ID: {key}</p>
                        </div>
                      </div>
                      {prop.type === "select" && prop.select?.options && (
                        <div className="mt-2 text-xs text-text-secondary">
                          옵션: {prop.select.options.map((o: any) => o.name).join(", ")}
                        </div>
                      )}
                      {prop.type === "multi_select" && prop.multi_select?.options && (
                        <div className="mt-2 text-xs text-text-secondary">
                          옵션: {prop.multi_select.options.map((o: any) => o.name).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 파싱된 폼 필드 */}
          <Card elevation={1}>
            <CardHeader>
              <h2 className="text-xl font-semibold text-text-primary">
                파싱된 폼 필드 ({parsedSchema.fields.length}개)
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedSchema.fields.map((field) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-lg border-2 border-primary-300 bg-primary-50/50 dark:bg-primary-900/10"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-text-primary">{field.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPropertyTypeColor(
                              field.type
                            )}`}
                          >
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              필수
                            </span>
                          )}
                          {field.order !== undefined && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              순서: {field.order}
                            </span>
                          )}
                          {field.isLongText && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              긴 텍스트
                            </span>
                          )}
                          {field.maxSelections && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              최대 {field.maxSelections}개
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary font-mono">ID: {field.id}</p>
                      </div>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="mt-2 text-xs text-text-secondary">
                        옵션: {field.options.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 비교 요약 */}
      {rawData && parsedSchema && (
        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">비교 요약</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">원본 속성 수:</span>{" "}
                {Object.keys(rawData.properties || {}).length}개
              </p>
              <p>
                <span className="font-medium">파싱된 필드 수:</span> {parsedSchema.fields.length}개
              </p>
              <p>
                <span className="font-medium">필터링된 속성:</span>{" "}
                {Object.keys(rawData.properties || {}).filter(
                  ([key, prop]: [string, any]) => !isSupportedType(prop.type)
                ).length}
                개
              </p>
              <p>
                <span className="font-medium">데이터베이스 ID:</span>{" "}
                <code className="text-xs bg-surface-elevated px-2 py-1 rounded">
                  {parsedSchema.databaseId}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
