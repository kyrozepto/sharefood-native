"use client"

import { useState, useEffect } from "react"
import * as Font from "expo-font"

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          CarosLight: require("../../assets/fonts/CarosLight.otf"),
          CarosRegular: require("../../assets/fonts/CarosRegular.otf"),
          CarosMedium: require("../../assets/fonts/CarosMedium.otf"),
          CarosBold: require("../../assets/fonts/CarosBold.otf"),
          CarosHeavy: require("../../assets/fonts/CarosHeavy.otf"),
        })
        setFontsLoaded(true)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load fonts"))
        console.error("Error loading fonts:", err)
      }
    }

    loadFonts()
  }, [])

  return { fontsLoaded, error }
}
