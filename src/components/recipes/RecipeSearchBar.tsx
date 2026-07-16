"use client";

import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { useRecipeSearchQuery } from "@/hooks/useRecipeSearchQuery";

export function RecipeSearchBar() {
  const { query, setQuery } = useRecipeSearchQuery();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim() !== query.trim()) {
        setQuery(value);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, query, setQuery]);

  return (
    <Form
      className="recipe-search-bar py-2"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(value);
      }}
    >
      <InputGroup>
        <Form.Control
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="搜尋菜式、材料…"
          aria-label="搜尋菜式"
          autoComplete="off"
        />
        {value && (
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              setValue("");
              setQuery("");
            }}
            aria-label="清除搜尋"
          >
            ✕
          </Button>
        )}
      </InputGroup>
    </Form>
  );
}
