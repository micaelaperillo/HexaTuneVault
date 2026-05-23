from django.db import models
from django.contrib.auth import get_user_model
import uuid
from datetime import datetime
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin
)
# Create your models here.

User = get_user_model()

class Profile(models.Model):
    user = models.ForeignKey(User,related_name='public_info', on_delete=models.CASCADE)
    id_user = models.IntegerField()
    bio = models.TextField(blank=True)
    profileimg = models.ImageField(upload_to='profile_image', default='default_profile.jpg')
    location = models.CharField(max_length=100, blank=True)
    followers = models.PositiveIntegerField(default = 0)
    isArtist = models.BooleanField(default=False)
    # TODO guardar artistas/albumes favoritos

    def __str__(self):
        return self.user.username

class Vault(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    vtype = models.TextField(default = "vault")
    title = models.TextField(max_length=150)
    description = models.TextField(default = "this is the vault description")
    external_url = models.TextField(max_length = 150)
    genres = models.TextField(default = "here are the genres")
    rating = models.FloatField(default = 0)
    spotifyimg = models.ImageField(upload_to= 'vault_image', default='unknown_vault.jpg')
    followers = models.PositiveIntegerField(default = 0)
    likes = models.PositiveIntegerField(default = 0)
    authors = models.TextField(null=True)
    total_tracks = models.PositiveIntegerField(default = 0)
    date = models.TextField(default = "2020-01-01")
    def str(self):
        return self.title

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    #ahora muestro el post aun si el usuario borro su cuenta pero se debe manejar para que la redireccion sea a una pagina de error
    #user = models.ForeignKey(Profile,related_name='profile', null = yes, on_delete=models.RESTRICT)
    user = models.CharField(max_length=50)
    vault_id = models.CharField(max_length=50)
    likes = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    date = models.DateField(default=datetime.now)
    title = models.TextField(max_length=60)
    content = models.TextField(max_length=597)

    def __str__(self):
        return self.user

class VaultFavs(models.Model):
    user = models.CharField(max_length=50)
    vault = models.ForeignKey('Vault',related_name='vault_favs', on_delete=models.CASCADE)
    def __str__(self):
        return self.vault.external_url

class likedPosts(models.Model):
    user = models.CharField(max_length=50)
    post = models.ForeignKey('Post',related_name='post_liked', on_delete=models.CASCADE)
    def __str__(self):
        return self.post.id

class likedComments(models.Model):
    user= models.CharField(max_length=50)
    comment = models.ForeignKey('Comment',related_name='comment_liked', on_delete=models.CASCADE)
    def __str__(self):
        return self.comment.id

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    #ahora muestro el comentario aun si el usuario borro su cuenta pero se debe manejar para que la redireccion sea a una pagina de error
    # user = models.ForeignKey(Profile,related_name='profile', null = yes, on_delete=models.RESTRICT)
    user = models.CharField(max_length=50)
    #se deja de mostrar el comentario si se borro el post
    #tal vez se puede modificar el post para saber si fue borrado y en ese caso que no se muestre desde el front pero si se siga obteniendo para ser mostrados los comentarios asociados
    post_id = models.CharField(max_length=50)
    #verificar como se maneja este caso dado que si se referencia a una primary key no puedo ponerlo en null
    #tal vez se podría crear una especie de comentario asociado a cada vault poniendo como en reddit las reglas de moderacion del vault
    # entonces por defecto el primer comentario hace referencia a ese default (aunque visualmente solo responda a un post)
    #sino con que null este en true
    # comment_answer_id = models.ForeignKey(Comment,related_name='comment_answer', on_delete=models.RESTRICT)
    comment_answer_id = models.CharField(max_length=50, default=0)
    likes = models.IntegerField(default=0)
    date = models.DateField(default=datetime.now)
    content = models.TextField(max_length=597)

    def __str__(self):
        return self.user

class FollowersCount(models.Model):
    follower = models.CharField(max_length=100)
    user = models.CharField(max_length=100)

    def __str__(self):
        return self.user
