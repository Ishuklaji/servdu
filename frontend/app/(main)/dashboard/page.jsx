import React from "react";
import { Globe, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getRecipeOfTheDay,
  getCategories,
  getAreas,
} from "@/actions/mealdb.actions";
import { getCategoryEmoji, getCountryFlag } from "@/lib/data";

export default async function DashboardPage() {
    
}