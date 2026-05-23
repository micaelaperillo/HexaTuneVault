from django.shortcuts import render, redirect
from .models import Profile, Post, Comment, Vault, FollowersCount, VaultFavs, likedComments, likedPosts
from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from .forms import PostForm, CommentForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views import View
from spotipy.oauth2 import SpotifyClientCredentials
import spotipy
import json
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from django.db.models import F
from .utils import *

load_dotenv()


# Create your views here.

def home(request):
    context = get_following_latest_posts(request)
    return render(request, 'home.html', context)


@login_required(login_url='signin')
def settings_profile(request):
    user_profile = Profile.objects.get(user__username=request.user)

    if request.method == 'POST':

        if request.FILES.get('image') == None:
            image = user_profile.profileimg
            bio = request.POST['bio']
            location = request.POST['location']

            user_profile.profileimg = image
            user_profile.bio = bio
            user_profile.location = location
            user_profile.save()

        if request.FILES.get('image') != None:
            image = request.FILES.get('image')
            bio = request.POST['bio']
            location = request.POST['location']

            user_profile.profileimg = image
            user_profile.bio = bio
            user_profile.location = location
            user_profile.save()

        return redirect('settings')
    # TODO ver que anda
    return render(request, 'settingsProfile.html', {'user_profile': user_profile})


def profile(request, user=None):
    if user is None:
        user = request.user.username

    user_profile = get_profile(user)
    user_posts = get_posts(user)
    user_post_length = len(user_posts)
    user_favourites = get_user_vault_favs(user)

    follower = request.user.username
    userToFollow = user

    if FollowersCount.objects.filter(follower=follower, user=userToFollow).first():
        button_text = 'Unfollow'
    else:
        button_text = 'Follow'

    user_followers = get_user_followers(user)
    user_following = get_user_following(user)
    user_followers_count = FollowersCount.objects.filter(user=userToFollow).count()
    user_following_count = FollowersCount.objects.filter(follower=userToFollow).count()

    context = {
        'user_profile': user_profile,
        'user_posts': user_posts,
        'user_post_length': user_post_length,
        'user_favourites': user_favourites,
        'button_text': button_text,
        'user_followers_count': user_followers_count,
        'user_following_count': user_following_count,
        'user_followers': user_followers,
        'user_following': user_following,
        'isCurrentUser': user == request.user.username,
    }
    return render(request, 'profile.html', context)


@login_required(login_url='signin')
def follow(request):
    follower = request.user.username

    if request.method == 'POST':
        user = request.POST['user']

        if FollowersCount.objects.filter(follower=follower, user=user).first():
            delete_follower = FollowersCount.objects.get(follower=follower, user=user)
            delete_follower.delete()
            return redirect('/profile/' + user)
        else:
            new_follower = FollowersCount.objects.create(follower=follower, user=user)
            new_follower.save()
            return redirect('/profile/' + user)
    else:
        return redirect('/')


def signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        isArtist = 'isArtist' in request.POST and request.POST['isArtist'] == 'on'
        password = request.POST['password']
        password2 = request.POST['password2']

        if password == password2:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email is already associated with an existing account')
                return redirect('create_account')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username already exists, please choose another one')
                return redirect('create_account')
            elif isArtist:
                if request.POST['link'] != '':
                    if not verify_artist(request.POST['link']):
                        messages.info(request, "You must provide a valid Spotify profile for artists")
                        return redirect('create_account')
                    else:
                        user = User.objects.create_user(username=username, email=email, password=password)
                        user.save()

                        # log user in and redirect to settings page
                        user_login = auth.authenticate(username=username, password=password)
                        auth.login(request, user_login)

                        # create a Profile object for the new user
                        user_model = User.objects.get(username=username)
                        new_profile = Profile.objects.create(user=user_model, id_user=user_model.id, isArtist=isArtist)
                        new_profile.save()
                        return redirect('profile')

                else:
                    messages.info(request, "You must verify your Spotify profile")
                    return redirect('create_account')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()

                # log user in and redirect to settings page
                user_login = auth.authenticate(username=username, password=password)
                auth.login(request, user_login)

                # create a Profile object for the new user
                user_model = User.objects.get(username=username)
                new_profile = Profile.objects.create(user=user_model, id_user=user_model.id, isArtist=isArtist)
                new_profile.save()
                return redirect('profile')
        else:
            messages.info(request, 'Password not matching')
            return redirect('create_account')

    else:
        return render(request, 'createAccount.html')


def signin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('home')
        else:
            messages.info(request, 'Invalid username or password')
            return redirect('login')

    else:
        return render(request, 'login.html')


@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    return redirect('login')


def vault(request, vtype, id):
    # id es el ID del album/artista
    # info: id, tipo (podcast/album), nombre, artista, descripcion, foto, foto del artista, likes, duracion, canciones
    vault = get_or_create_by_id(vtype, id)
    form = PostForm(request.POST)
    if form.is_valid():
        new_post = form.save(commit=False)
        new_post.user = request.user
        new_post.vault_id = id
        new_post.rating = form.cleaned_data['rating']
        new_post.save()
    posts = getPostsWithCommentCount(id, request.user)
    rating = getVaultRating(id)
    first_post = Post.objects.filter(user=request.user, vault_id=id).count() == 0
    vault_id = Vault.objects.filter(external_url__contains=id).first().id
    is_fav = VaultFavs.objects.filter(user=request.user.username, vault=vault_id).exists()
    likes = get_vault_fav_count(Vault.objects.filter(external_url__contains=id).first())

    print(request.path)

    context = {'vault': vault, 'posts': posts, 'form': form, 'rating': rating, 'first_post': first_post,
               'is_fav': is_fav, 'vault_id': id, 'likes': likes, 'is_post': True, 'path': request.path}
    return render(request, 'vault.html', context)


def gallery(request):
    # muestra los albums/artists/podcasts guardados en la bd
    # info: id, nombre, tipo, likes, fo
    list = []
    for vault in Vault.objects.all():
        list.append({"id": vault.id, "title": vault.title, "vtype": vault.vtype, "likes": vault.likes,
                     "spotifyimg": vault.spotifyimg})
    return render(request, 'gallery.html', {list})


@login_required(login_url='login')
def fav_or_unfav_vault(request):
    if request.method == 'POST':
        vault_id = request.POST['vault_id']
        vtype = request.POST['vtype']
        vault_id_path = request.POST['vault_id_path']
        vaultfav = VaultFavs.objects.filter(user=request.user, vault=vault_id)
        if (vaultfav.exists()):
            vaultfav.delete()
            Vault.objects.filter(id=vault_id).update(followers=F('followers') - 1)
        else:
            vault = Vault.objects.get(id=vault_id)
            newvaultfav = VaultFavs.objects.create(user=request.user.username, vault=vault)
            newvaultfav.save()
            Vault.objects.filter(id=vault_id).update(followers=F('followers') + 1)
        return redirect('/vault/' + vtype + '/' + vault_id_path)


# TOD?: hacerlo menos repetitivo
@login_required(login_url='login')
def like_or_unlike_comment(request):
    if request.method == 'POST':
        comment_id = request.POST['comment_id']
        path = request.POST['path']
        auxComment = Comment.objects.get(id=comment_id)
        comment = likedComments.objects.filter(user=request.user, comment=auxComment)
        if (comment.exists()):
            comment.delete()
            Comment.objects.filter(id=comment_id).update(likes=F('likes') - 1)
        else:
            newcomment = likedComments.objects.create(user=request.user.username, comment=auxComment)
            newcomment.save()
            Comment.objects.filter(id=comment_id).update(likes=F('likes') + 1)
        return redirect(path)


@login_required(login_url='login')
def like_or_unlike_post(request):
    if request.method == 'POST':
        post_id = request.POST['post_id']
        path = request.POST['path']
        auxPost = Post.objects.get(id=post_id)
        post = likedPosts.objects.filter(post=auxPost, user=request.user)
        if (post.exists()):
            post.delete()
            Post.objects.filter(id=post_id).update(likes=F('likes') - 1)
        else:
            newpost = likedPosts.objects.create(user=request.user.username, post=auxPost)
            newpost.save()
            Post.objects.filter(id=post_id).update(likes=F('likes') + 1)
        return redirect(path)


def music(request):
    if request.method == 'POST':
        query = request.POST['query']
        genre = request.POST['genre']
        if genre != '' and query != '':
            query += '/?genre=' + genre
        return redirect('/music/' + query)
    else:
        context = format_top50(0)
        return render(request, 'music.html', context)


def music_search(request, query):
    if request.method == 'POST':
        query = request.POST['query']
        genre = request.POST['genre']
        if genre != '' and query != '':
            query += '/?genre=' + genre
        return redirect('/music/' + query)
    else:
        market = request.GET.get('market', None)
        genre = request.GET.get('genre', None)
        album_type = request.GET.get('album_type', None)
        context = search_music(query, genre=genre, album_type=album_type, market=market)
        return render(request, 'searchMusic.html', context)


def podcasts(request):
    if request.method == 'POST':
        query = request.POST['query']
        content = request.POST['content']
        media_type = request.POST['media_type']
        if content != '' and query != '':
            query += '/?explicit=' + content
        if media_type != '' and query != '':
            if content != '':
                query += '&media_type=' + media_type
            else: 
                query += '/?media_type=' + media_type
        return redirect('/podcasts/' + query)
    else:
        context = get_top_podcasts()
        return render(request, 'podcasts.html', context)


def podcasts_search(request, query):
    if request.method == 'POST':
        query = request.POST['query']
        content = request.POST['content']
        media_type = request.POST['media_type']
        if content != '' and query != '':
            query += '/?explicit=' + content
        if media_type != '' and query != '':
            if content != '':
                query += '&media_type=' + media_type
            else: 
                query += '/?media_type=' + media_type
        return redirect('/podcasts/' + query)
    else:
        market = request.GET.get('market', None)
        explicit = request.GET.get('explicit', None)
        media_type = request.GET.get('media_type', None)
        context = search_podcast(query, explicit=explicit, market=market, media_type=media_type)
        return render(request, 'searchPodcasts.html', context)


def all_search(request, query):
    if request.method == 'POST':
        query = request.POST['query']
        print("hial")
        return redirect('/search/' + query)
    else:
        market = request.GET.get('market', None)
        context = search_all(query, 3, market=market)
        return render(request, 'searchResult.html', context)


def members(request):
    if request.method == 'POST':
        query = request.POST['query']
        return redirect('/members/' + query)
    else:
        context = get_recommended_profiles()
        return render(request, 'members.html', context)


def members_search(request, query):
    if request.method == 'POST':
        query = request.POST['query']
        return redirect('/members/' + query)
    else:
        context = search_member(query)
        return render(request, 'searchMembers.html', context)


class vaultPost(View):
    def get(self, request, post_id, *args, **kwargs):
        comment_count = Comment.objects.filter(post_id=post_id).count()
        chain_comments = getChainOfComments(post_id, request)
        post = Post.objects.get(id=post_id)
        form = CommentForm()

        context = {
            'post': post,
            'post_user': Profile.objects.get(user__username=post.user),
            'likes': get_post_likes_count(post),
            'is_liked': is_post_liked_by_current_user(request.user.username, post),
            'form': form,
            'comments': chain_comments,
            'comment_count': comment_count,
            'is_post': False,
            'path': request.path,
        }
        return render(request, 'post.html', context)

    def post(self, request, post_id, *args, **kwargs):
        post = Post.objects.get(id=post_id)
        form = CommentForm(request.POST)

        if form.is_valid():
            new_comment = form.save(commit=False)
            new_comment.user = request.user
            new_comment.post_id = post_id
            new_comment.save()

        comment_count = Comment.objects.filter(post_id=post_id).count()
        chain_comments = getChainOfComments(post_id, request)

        context = {
            'post': post,
            'form': form,
            'likes': get_post_likes_count(post),
            'is_liked': is_post_liked_by_current_user(request.user.username, post),
            'comments': chain_comments,
            'comment_count': comment_count,
            'is_post': False,
            'path': request.path,
        }

        return render(request, 'post.html', context)


auth_manager = SpotifyClientCredentials()
sp = spotipy.Spotify(auth_manager=auth_manager)
