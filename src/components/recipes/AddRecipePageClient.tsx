"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { AppShell } from "@/components/layout/AppShell";
import { AppLink } from "@/components/layout/AppLink";
import { InstagramImportCard } from "@/components/recipes/InstagramImportCard";
import { ACCOUNTS } from "@/lib/accounts";
import {
  generateCustomRecipeId,
  getCustomRecipeById,
  upsertCustomRecipe,
  deleteCustomRecipe,
} from "@/lib/customRecipes";
import type { RecipeDraft } from "@/lib/recipeDraft";
import { generateId } from "@/lib/utils";
import type { CuisineType, Ingredient, Recipe } from "@/types";
import { useAccountStore } from "@/stores/accountStore";

type IngredientDraft = { id: string; name: string; amount: string };

const CUISINES: Array<{ value: CuisineType; label: string }> = [
  { value: "chinese", label: "中餐" },
  { value: "western", label: "西餐" },
  { value: "japanese", label: "日式" },
  { value: "italian", label: "意式" },
];

export function AddRecipePageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");
  const currentUserId = useAccountStore((state) => state.currentUserId);

  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState<CuisineType>("chinese");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [prepTime, setPrepTime] = useState("");
  const [baseServings, setBaseServings] = useState(2);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    { id: generateId(), name: "", amount: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;
    if (!editingId) {
      setLoading(false);
      return;
    }

    const recipe = getCustomRecipeById(editingId);
    if (!recipe || recipe.createdBy !== currentUserId) {
      setMessage("你無權編輯呢個菜式");
      setLoading(false);
      return;
    }

    setEditingRecipe(recipe);
    setName(recipe.name);
    setCuisine(recipe.cuisine);
    setDescription(recipe.description);
    setDifficulty(recipe.difficulty);
    setPrepTime(recipe.prepTime > 0 ? String(recipe.prepTime) : "");
    setBaseServings(recipe.baseServings);
    setImageUrl(recipe.imageUrl);
    setIngredients(
      recipe.ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
      }))
    );
    setSteps(recipe.steps.length > 0 ? recipe.steps : [""]);
    setLoading(false);
  }, [editingId, currentUserId]);

  const isEditing = Boolean(editingRecipe);
  const canSubmit = name.trim().length > 0;

  const ownerName = useMemo(() => {
    if (!currentUserId) return "用戶";
    return ACCOUNTS[currentUserId]?.name ?? "用戶";
  }, [currentUserId]);

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { id: generateId(), name: "", amount: "" }]);
  };

  const removeIngredientRow = (id: string) => {
    setIngredients((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const updateIngredientRow = (id: string, patch: Partial<IngredientDraft>) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (index: number) => {
    setSteps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };
  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
  };

  const applyImportDraft = (draft: RecipeDraft) => {
    setName(draft.name || "");
    setCuisine(draft.cuisine || "chinese");
    setDescription(draft.description || "");
    setDifficulty(Math.max(1, Math.min(5, draft.difficulty || 1)));
    setPrepTime(draft.prepTime > 0 ? String(draft.prepTime) : "");
    setBaseServings(Math.max(1, Math.min(12, draft.baseServings || 2)));
    if (draft.imageUrl) setImageUrl(draft.imageUrl);
    setIngredients(
      draft.ingredients.length > 0
        ? draft.ingredients.map((ing) => ({
            id: generateId(),
            name: ing.name,
            amount: ing.amount,
          }))
        : [{ id: generateId(), name: "", amount: "" }]
    );
    setSteps(draft.steps.length > 0 ? draft.steps : [""]);
    setMessage(
      draft.sourceNote
        ? `${draft.sourceNote}${draft.sourceUrl ? `（來源：${draft.sourceUrl}）` : ""}`
        : "已從 Instagram 內容填入表單，請核對後再儲存。"
    );
  };

  const handleDelete = () => {
    if (!isEditing || !editingRecipe || !currentUserId) return;
    const ok = window.confirm(`確定要刪除「${editingRecipe.name}」？`);
    if (!ok) return;
    const deleted = deleteCustomRecipe(editingRecipe.id, currentUserId);
    if (deleted) {
      window.alert("菜式已刪除");
      router.replace("/recipes/");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!currentUserId) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("請輸入菜式名稱");
      return;
    }

    const validIngredients: Ingredient[] = ingredients
      .map((ing, index) => ({
        id: ing.id || `custom-ing-${index}`,
        name: ing.name.trim(),
        amount: ing.amount.trim() || "適量",
      }))
      .filter((ing) => ing.name.length > 0);

    if (validIngredients.length === 0) {
      setMessage("請至少加入一項材料");
      return;
    }

    const validSteps = steps.map((step) => step.trim()).filter(Boolean);

    const nowIso = new Date().toISOString();
    const nextRecipe: Recipe = {
      id: editingRecipe?.id ?? generateCustomRecipeId(),
      name: trimmedName,
      cuisine,
      baseServings: Math.max(1, Math.min(12, baseServings)),
      description: description.trim(),
      difficulty: Math.max(1, Math.min(5, difficulty)),
      prepTime: Math.max(0, Number(prepTime || 0)),
      imageUrl: imageUrl.trim(),
      ingredients: validIngredients,
      steps: validSteps,
      isCustom: true,
      createdBy: editingRecipe?.createdBy ?? currentUserId,
      createdByName: editingRecipe?.createdByName ?? ownerName,
      createdAt: editingRecipe?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    const ok = upsertCustomRecipe(nextRecipe, currentUserId);
    if (!ok) {
      setMessage("儲存失敗，請重試");
      return;
    }

    router.replace(`/recipes/${encodeURIComponent(nextRecipe.id)}/`);
  };

  if (!currentUserId) {
    return (
      <AppShell title="加入菜式" showBack backHref="/recipes/">
        <Alert variant="warning" className="mt-3">
          請先揀選帳戶先可以加入自訂菜式。
        </Alert>
        <AppLink href="/account/" className="btn btn-primary">
          去揀帳戶
        </AppLink>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell title="加入菜式" showBack backHref="/recipes/">
        <p className="text-secondary py-4">載入中…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={isEditing ? "編輯菜式" : "加入菜式"} showBack backHref="/recipes/">
      <div className="d-flex flex-column gap-4">
        <div>
          <h1 className="h4 fw-bold mb-1">{isEditing ? "編輯菜式" : "加入菜式"}</h1>
          <p className="text-secondary small mb-0">
            填寫你嘅菜式資料。除菜式名稱同材料外，其他欄位可留空。
          </p>
        </div>

        {message && (
          <Alert variant="success" className="py-2 mb-0">
            {message}
          </Alert>
        )}

        {!isEditing && <InstagramImportCard onApplyDraft={applyImportDraft} />}

        <Form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h6 className="fw-bold mb-3">基本資料</h6>
            <Form.Group className="mb-3">
              <Form.Label>菜式名稱</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：媽咪秘製咖喱"
                required
              />
            </Form.Group>
            <Row className="g-3">
              <Col xs={6}>
                <Form.Label>菜系</Form.Label>
                <Form.Select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value as CuisineType)}
                >
                  {CUISINES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label>預設人數</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={12}
                  value={baseServings}
                  onChange={(e) => setBaseServings(Number(e.target.value || 2))}
                />
              </Col>
              <Col xs={6}>
                <Form.Label>難度（1-5）</Form.Label>
                <Form.Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                >
                  <option value={1}>★☆☆☆☆</option>
                  <option value={2}>★★☆☆☆</option>
                  <option value={3}>★★★☆☆</option>
                  <option value={4}>★★★★☆</option>
                  <option value={5}>★★★★★</option>
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label>準備時間（分鐘）</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="可留空"
                />
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>簡介</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述呢道菜…（可留空）"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>圖片網址</Form.Label>
              <Form.Control
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…（可留空）"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">材料</h6>
              <Button type="button" variant="outline-primary" size="sm" onClick={addIngredientRow}>
                + 加材料
              </Button>
            </div>
            <div className="d-flex flex-column gap-2">
              {ingredients.map((ingredient) => (
                <Row key={ingredient.id} className="g-2 align-items-end">
                  <Col xs={5}>
                    <Form.Label className="small text-secondary mb-1">材料名稱</Form.Label>
                    <Form.Control
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredientRow(ingredient.id, { name: e.target.value })
                      }
                      placeholder="例如：雞蛋"
                    />
                  </Col>
                  <Col xs={5}>
                    <Form.Label className="small text-secondary mb-1">份量</Form.Label>
                    <Form.Control
                      value={ingredient.amount}
                      onChange={(e) =>
                        updateIngredientRow(ingredient.id, { amount: e.target.value })
                      }
                      placeholder="例如：2隻"
                    />
                  </Col>
                  <Col xs={2}>
                    <Button
                      type="button"
                      variant="light"
                      className="w-100"
                      onClick={() => removeIngredientRow(ingredient.id)}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">煮食步驟</h6>
              <Button type="button" variant="outline-primary" size="sm" onClick={addStep}>
                + 加步驟
              </Button>
            </div>
            <div className="d-flex flex-column gap-2">
              {steps.map((step, index) => (
                <div key={`step-${index}`} className="d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="描述呢個步驟…"
                  />
                  <Button type="button" variant="light" onClick={() => removeStep(index)}>
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <p className="small text-secondary mt-2 mb-0">步驟可留空，之後再補充</p>
          </Card.Body>
        </Card>

        <div className="d-grid gap-2">
          <Button type="submit" variant="primary" size="lg" disabled={!canSubmit}>
            {isEditing ? "儲存更改" : "加入菜式"}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline-danger" onClick={handleDelete}>
              🗑 刪除此菜式
            </Button>
          )}
        </div>
        </Form>
      </div>
    </AppShell>
  );
}
