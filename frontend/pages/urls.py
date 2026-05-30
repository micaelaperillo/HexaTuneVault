from django.urls import path

from . import views

#OG url patterns
urlpatterns = [
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
    path('vault/<str:vtype>/<str:id>/post/<str:post_id>', views.vault_post, name='post'),
    path('search/<str:query>/', views.all_search, name='search'),
    path('follow/', views.follow, name='follow'),
    path('favourite/', views.fav_or_unfav_vault, name='favourite'),
    path('likepost/', views.like_or_unlike_post, name='like_post'),
    path('likecomment/', views.like_or_unlike_comment, name='like_comment'),
]
