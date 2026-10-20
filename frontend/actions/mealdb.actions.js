"use server";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

export async function getRecipeOfTheDay() {
  try {
    const response = await fetch(`${MEALDB_BASE}/random.php`, {
      next: { revalidate: 60 * 60 * 24 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recipe of the day");
    }
    const data = await response.json();
    return {
      success: true,
      recipe: data.meals[0],
    };
  } catch (error) {
    console.error("Error fetching recipe of the day:", error);
    throw new Error(
      error.message || "An error occurred while fetching the recipe of the day",
    );
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
      next: { revalidate: 60 * 60 * 24 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return {
      success: true,
      categories: data.categories,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(
      error.message || "An error occurred while fetching the categories",
    );
  }
}

export async function getAreas() {}

export async function getMealsByCategory(category) {}

export async function getMealsByArea(area) {}
