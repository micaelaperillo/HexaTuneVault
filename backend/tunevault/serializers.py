from rest_framework import serializers
from .models import Profile, Post, Comment, Vault

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id_user', 'user', 'bio', 'profileimg', 'location')

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id', 'user', 'vault_id', 'likes', 'date', 'title', 'content')

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('id', 'user', 'post_id', 'comment_answer_id', 'likes', 'date', 'content')

class VaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vault
        fields = ('id', 'title', 'description', 'genres', 'rating', 'spotifyimg', 'followers', 'likes')