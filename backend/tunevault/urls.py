from django.urls import path, include
from . import views
from django.contrib import admin
from .views import vaultPost
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('music/', views.music, name='music'),
    path('music/<str:query>/', views.music_search, name='music_search'),
    path('podcasts/', views.podcasts, name='podcasts'),
    path('podcasts/<str:query>/', views.podcasts_search, name='podcasts_search'),
    path('login/', views.signin, name='login'),
    path('create_account/', views.signup, name='create_account'),
    path('logout/', views.logout, name='logout'),
    path('members/', views.members, name='members'),
    path('members/<str:query>/', views.members_search, name='members_search'),
    path('settings/', views.settings_profile, name='settings'),
    path('profile/', views.profile, name='profile'),
    path('profile/<str:user>', views.profile, name='profile'),
    path('vault/<str:vtype>/<str:id>', views.vault, name='vault'),
    path('vault/<str:vtype>/<str:id>/post/<str:post_id>', vaultPost.as_view(), name='post'),
    path('search/<str:query>/', views.all_search, name='search'),
    path('follow/', views.follow, name='follow'),
    path('favourite/', views.fav_or_unfav_vault, name='favourite'),
    path('likepost/', views.like_or_unlike_post, name='like_post'),
    path('likecomment/', views.like_or_unlike_comment, name='like_comment'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)