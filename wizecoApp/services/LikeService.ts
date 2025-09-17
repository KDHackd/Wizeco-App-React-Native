import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LikedItem {
  objectId: number;
  objectType: string;
  likedAt: number;
  userId: string; // Ajouter l'ID utilisateur pour la persistance
}

class LikeService {
  private readonly STORAGE_KEY = "user_likes";

  /**
   * Récupérer tous les likes de l'utilisateur
   */
  async getUserLikes(): Promise<LikedItem[]> {
    try {
      const likesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return likesJson ? JSON.parse(likesJson) : [];
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des likes:", error);
      return [];
    }
  }

  /**
   * Vérifier si un objet est liké par l'utilisateur
   */
  async isLiked(
    objectId: number,
    objectType: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const likes = await this.getUserLikes();
      return likes.some(
        (like) =>
          like.objectId === objectId &&
          like.objectType === objectType &&
          (!userId || like.userId === userId)
      );
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du like:", error);
      return false;
    }
  }

  /**
   * Ajouter un like
   */
  async addLike(
    objectId: number,
    objectType: string,
    userId?: string
  ): Promise<void> {
    try {
      const likes = await this.getUserLikes();
      const existingLike = likes.find(
        (like) =>
          like.objectId === objectId &&
          like.objectType === objectType &&
          (!userId || like.userId === userId)
      );

      if (!existingLike) {
        const newLike: LikedItem = {
          objectId,
          objectType,
          likedAt: Date.now(),
          userId: userId || "anonymous",
        };
        likes.push(newLike);
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(likes));
        console.log("✅ Like ajouté localement:", newLike);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du like:", error);
    }
  }

  /**
   * Supprimer un like
   */
  async removeLike(
    objectId: number,
    objectType: string,
    userId?: string
  ): Promise<void> {
    try {
      const likes = await this.getUserLikes();
      const filteredLikes = likes.filter(
        (like) =>
          !(
            like.objectId === objectId &&
            like.objectType === objectType &&
            (!userId || like.userId === userId)
          )
      );
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(filteredLikes)
      );
      console.log("✅ Like supprimé localement");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du like:", error);
    }
  }

  /**
   * Toggle un like (ajouter si pas liké, supprimer si liké)
   */
  async toggleLike(
    objectId: number,
    objectType: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const isCurrentlyLiked = await this.isLiked(objectId, objectType, userId);

      if (isCurrentlyLiked) {
        await this.removeLike(objectId, objectType, userId);
        return false; // Plus liké
      } else {
        await this.addLike(objectId, objectType, userId);
        return true; // Maintenant liké
      }
    } catch (error) {
      console.error("❌ Erreur lors du toggle du like:", error);
      return false;
    }
  }

  /**
   * Nettoyer tous les likes (pour déconnexion)
   */
  async clearAllLikes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log("✅ Tous les likes supprimés");
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage des likes:", error);
    }
  }
}

export default new LikeService();
