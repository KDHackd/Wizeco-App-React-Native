const API_BASE_URL = "http://192.168.100.95:3000/api/partner/v1";
const PARTNER_API_KEY = "2984a55b-5fe3-4de8-8e06-2370a1bc2541";

export enum SocialActionObjectType {
  CATALOG = "CATALOG",
  PROMO_FLASH = "PROMO_FLASH",
  HALTE_GACHIS = "HALTE_GACHIS",
}

export enum SocialActionType {
  LIKE = "LIKE",
  SAVE = "SAVE",
  SHARE = "SHARE",
}

export interface SocialActionsCount {
  LIKE: number;
  SAVE: number;
  SHARE: number;
}

export class SocialActionsService {
  private static getHeaders() {
    return {
      Authorization: `Bearer ${PARTNER_API_KEY}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Récupérer les compteurs d'actions sociales pour un objet
   */
  static async getSocialActionsCount(
    objectId: string,
    objectType: SocialActionObjectType
  ): Promise<SocialActionsCount> {
    try {
      console.log("📊 Récupération des actions sociales:", {
        objectId,
        objectType,
      });

      const response = await fetch(
        `${API_BASE_URL}/social_actions?object_id=${objectId}&object_type=${objectType}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Actions sociales récupérées:", data);

      return {
        LIKE: data.LIKE || 0,
        SAVE: data.SAVE || 0,
        SHARE: data.SHARE || 0,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des actions sociales:",
        error
      );
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        LIKE: 0,
        SAVE: 0,
        SHARE: 0,
      };
    }
  }

  /**
   * Incrémenter une action sociale (like, save, share)
   */
  static async incrementSocialAction(
    objectId: string,
    objectType: SocialActionObjectType,
    actionType: SocialActionType
  ): Promise<boolean> {
    try {
      console.log("👍 Incrémentation d'action sociale:", {
        objectId,
        objectType,
        actionType,
      });

      const response = await fetch(`${API_BASE_URL}/social_actions/increment`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          object_id: objectId,
          object_type: objectType,
          action_name: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Action sociale incrémentée:", data);

      return true;
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'incrémentation de l'action sociale:",
        error
      );
      return false;
    }
  }

  /**
   * Incrémenter le nombre de vues
   */
  static async incrementView(
    objectId: string,
    objectType: SocialActionObjectType
  ): Promise<boolean> {
    try {
      console.log("👁️ Incrémentation de vue:", { objectId, objectType });

      const response = await fetch(
        `${API_BASE_URL}/social_actions/increment_view`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            object_id: objectId,
            object_type: objectType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Vue incrémentée:", data);

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'incrémentation de la vue:", error);
      return false;
    }
  }

  /**
   * Liker un objet
   */
  static async likeObject(
    objectId: string,
    objectType: SocialActionObjectType
  ): Promise<boolean> {
    return await this.incrementSocialAction(
      objectId,
      objectType,
      SocialActionType.LIKE
    );
  }

  /**
   * Sauvegarder un objet
   */
  static async saveObject(
    objectId: string,
    objectType: SocialActionObjectType
  ): Promise<boolean> {
    return await this.incrementSocialAction(
      objectId,
      objectType,
      SocialActionType.SAVE
    );
  }

  /**
   * Partager un objet (incrémenter le compteur de partage)
   */
  static async shareObject(
    objectId: string,
    objectType: SocialActionObjectType
  ): Promise<boolean> {
    return await this.incrementSocialAction(
      objectId,
      objectType,
      SocialActionType.SHARE
    );
  }
}
