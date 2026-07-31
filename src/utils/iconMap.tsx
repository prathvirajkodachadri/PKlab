/**
 * iconMap — shared resolver turning icon NAMES stored in JSON catalogs
 * (categories.json, features.json) into real Lucide components.
 */
import {
  RotateCw, Disc, Compass, Activity, Settings, Cpu, BookOpen, Layers,
  Search, Smartphone, Code, FileText, Download, UserCheck, AlertTriangle,
  TrendingUp, MoveHorizontal, Zap, Wrench,
  LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  RotateCw, Disc, Compass, Activity, Settings, Cpu, BookOpen, Layers,
  Search, Smartphone, Code, FileText, Download, UserCheck, AlertTriangle,
  TrendingUp, MoveHorizontal, Zap, Wrench
};

export function getIconComponent(name: string): LucideIcon {
  return iconMap[name] ?? Cpu;
}
