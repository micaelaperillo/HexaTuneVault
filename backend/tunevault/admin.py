from django.contrib import admin
from .models import Profile, Vault, Post, Comment

# Register your models here.
admin.site.register(Profile)
admin.site.register(Vault)
admin.site.register(Post)
admin.site.register(Comment)
