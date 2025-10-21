"use client";

import { useEffect, useState } from "react";
import { ActionIcon, useComputedColorScheme, useMantineColorScheme, type ActionIconProps } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import classes from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  className?: string;
  variant?: ActionIconProps["variant"];
}

export default function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setColorScheme(computedColorScheme === "light" ? "dark" : "light");
  };

  const ariaLabel = mounted
    ? computedColorScheme === "light"
      ? "Activar modo oscuro"
      : "Activar modo claro"
    : "Alternar tema";

  return (
    <ActionIcon
      onClick={handleToggle}
      variant={variant}
      size={48}
      radius="xl"
      aria-label={ariaLabel}
      className={cn(classes.toggle, className)}
    >
      <IconSun className={cn(classes.icon, classes.lightIcon)} stroke={1.6} />
      <IconMoon className={cn(classes.icon, classes.darkIcon)} stroke={1.6} />
    </ActionIcon>
  );
}



