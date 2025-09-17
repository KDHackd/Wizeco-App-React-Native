import * as Clipboard from "expo-clipboard";
import { Alert, Share } from "react-native";

export class ShareService {
  /**
   * Partager une URL via les options de partage natives
   */
  static async shareUrl(
    url: string,
    title: string,
    message?: string
  ): Promise<void> {
    try {
      console.log("📤 Partage d'URL:", url);

      const shareMessage = message || `Découvrez ce catalogue : ${title}`;

      // Utiliser l'API de partage native de React Native
      const result = await Share.share({
        message: `${shareMessage}\n\n${url}`,
        url: url,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        console.log("✅ Partage réussi");
      } else if (result.action === Share.dismissedAction) {
        console.log("❌ Partage annulé");
      }
    } catch (error) {
      console.error("❌ Erreur lors du partage:", error);
      Alert.alert(
        "Erreur de partage",
        "Impossible de partager ce contenu. Veuillez réessayer."
      );
    }
  }

  /**
   * Copier une URL dans le presse-papiers
   */
  static async copyUrl(url: string, title: string): Promise<void> {
    try {
      console.log("📋 Copie d'URL:", url);

      await Clipboard.setStringAsync(url);

      Alert.alert(
        "Lien copié",
        `Le lien "${title}" a été copié dans le presse-papiers.`
      );

      console.log("✅ URL copiée");
    } catch (error) {
      console.error("❌ Erreur lors de la copie:", error);
      Alert.alert(
        "Erreur de copie",
        "Impossible de copier le lien. Veuillez réessayer."
      );
    }
  }

  /**
   * Partager un catalogue spécifique
   */
  static async shareCatalog(
    catalogUrl: string,
    catalogTitle: string,
    catalogDescription?: string
  ): Promise<void> {
    const message = catalogDescription
      ? `Découvrez "${catalogTitle}" : ${catalogDescription}`
      : `Découvrez le catalogue "${catalogTitle}"`;

    await this.shareUrl(catalogUrl, catalogTitle, message);
  }

  /**
   * Partager une promo flash
   */
  static async sharePromoFlash(
    promoUrl: string,
    promoTitle: string,
    promoDescription?: string
  ): Promise<void> {
    const message = promoDescription
      ? `Promo Flash : "${promoTitle}" - ${promoDescription}`
      : `Promo Flash : "${promoTitle}"`;

    await this.shareUrl(promoUrl, promoTitle, message);
  }

  /**
   * Partager une halte au gâchis
   */
  static async shareHalteGachi(
    halteUrl: string,
    halteTitle: string,
    halteDescription?: string
  ): Promise<void> {
    const message = halteDescription
      ? `Halte au gâchis : "${halteTitle}" - ${halteDescription}`
      : `Halte au gâchis : "${halteTitle}"`;

    await this.shareUrl(halteUrl, halteTitle, message);
  }
}
