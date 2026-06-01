
from functools import wraps

from django.conf import settings
from django.contrib import messages
from django.shortcuts import redirect, render

from .clients import api_client
from .clients import artist_client
from .clients import podcast_client
from .clients import album_client
from .clients import comment_client
from .clients import user_client
from .clients import image_client
from .clients import review_client


def login_required_api(view):
    """Redirect anonymous users to the login page (replaces @login_required)."""

    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        return view(request, *args, **kwargs)

    return wrapper


def _set_token_cookie(response, token):
    response.set_cookie(
        api_client.TOKEN_COOKIE,
        token,
        httponly=True,
        samesite='Lax',
        secure=not settings.DEBUG,
        max_age=86400,
    )
    return response



def home(request):
    timeline = []
    if request.user.is_authenticated:
        following = user_client.following(request.user.id, request=request)
        timeline = review_client.feed(following['users'], request=request)
    return render(request, 'home.html', {'timeline': timeline})



def signin(request):
    if request.method == 'POST':
        response = user_client.authenticate(
            request.POST.get('username'),
            request.POST.get('password'),
        )
        if response is not None and response.ok:
            token = response.json().get('accessToken')
            return _set_token_cookie(redirect('home'), token)
        messages.info(request, 'Invalid username or password')
        return redirect('login')
    return render(request, 'login.html')


def signup(request):
    if request.method == 'POST':
        if request.POST.get('password') != request.POST.get('password2'):
            messages.info(request, 'Password not matching')
            return redirect('create_account')

        username = request.POST.get('username')
        password = request.POST.get('password')
        response = user_client.create(
            username=username,
            password=password,
            email=request.POST.get('email'),
        )
        if response is not None and response.ok:
            auth = user_client.authenticate(username, password)
            if auth is not None and auth.ok:
                token = auth.json().get('accessToken')
                return _set_token_cookie(redirect('profile'), token)
            return redirect('login')

        detail = 'Could not create account'
        if response is not None:
            try:
                detail = response.json().get('message', detail)
            except ValueError:
                pass
        messages.info(request, detail)
        return redirect('create_account')
    return render(request, 'createAccount.html')


@login_required_api
def logout(request):
    response = redirect('login')
    response.delete_cookie(api_client.TOKEN_COOKIE)
    return response



def profile(request, user=None):
    if user is None:
        if not request.user.is_authenticated:
            return redirect('login')
        user = request.user.username

    user_profile = user_client.get_by_username(user, request=request) or {}
    is_current_user = (user == request.user.username)
    user_id = user_profile.get('id')
    user_posts = []
    followers = {'count': 0, 'users': []}
    following = {'count': 0, 'users': []}
    if user_id is not None:
        user_posts = review_client.list_by_author(user_id, request=request)
        followers = user_client.followers(user_id, request=request)
        following = user_client.following(user_id, request=request)
    context = {
        'user_profile': user_profile,
        'isCurrentUser': is_current_user,
        'button_text': 'Follow',
        'user_followers_count': followers['count'],
        'user_following_count': following['count'],
        'user_followers': {'followers': followers['users']},
        'user_following': {'following': following['users']},
        'user_post_length': len(user_posts),
        'user_posts': user_posts,
    }
    return render(request, 'profile.html', context)


@login_required_api
def settings_profile(request):
    user_id = request.user.id
    if request.method == 'POST':
        fields = {'biography': request.POST.get('bio', ''),'location':request.POST.get('location','')}
        image_url = image_client.upload(request.FILES.get('image'), request=request)
        if image_url:
            fields['profilePictureUrl'] = image_url
        user_client.edit(user_id, request=request, **fields)
        return redirect('settings')

    user_profile = user_client.get(user_id, request=request) or {}
    return render(request, 'settingsProfile.html', {'user_profile': user_profile})



def music(request):
    if request.method == 'POST':
        query = request.POST.get('query', '')
        genre = request.POST.get('genre', '')
        if genre and query:
            query += '/?genre=' + genre
        return redirect('/music/' + query)
    context = api_client.get_json('/api/music/trending', request=request, default={}) or {}
    return render(request, 'music.html', context)


def music_search(request, query):
    if request.method == 'POST':
        query = request.POST.get('query', '')
        genre = request.POST.get('genre', '')
        if genre and query:
            query += '/?genre=' + genre
        return redirect('/music/' + query)
    genre = request.GET.get('genre', '')
    artists = artist_client.search(query, genre, request=request)
    albums = album_client.search(query, request=request)
    context = {
        'result': [
            {'query': query, 'vaults': artists},
            {'query': query, 'vaults': albums},  
        ],
    }
    return render(request, 'searchMusic.html', context)



def podcasts(request):
    if request.method == 'POST':
        query = request.POST.get('query', '')
        content = request.POST.get('content', '')
        media_type = request.POST.get('media_type', '')
        if content and query:
            query += '/?explicit=' + content
        if media_type and query:
            query += ('&media_type=' if content else '/?media_type=') + media_type
        return redirect('/podcasts/' + query)
    context = api_client.get_json('/api/podcasts/trending', request=request, default={}) or {}
    return render(request, 'podcasts.html', context)


def podcasts_search(request, query):
    if request.method == 'POST':
        query = request.POST.get('query', '')
        content = request.POST.get('content', '')
        media_type = request.POST.get('media_type', '')
        if content and query:
            query += '/?explicit=' + content
        if media_type and query:
            query += ('&media_type=' if content else '/?media_type=') + media_type
        return redirect('/podcasts/' + query)
    explicit = request.GET.get('explicit', '')
    media_type = request.GET.get('media_type', '')
    market = request.GET.get('market', '')
    podcasts = podcast_client.search(
        query, explicit, media_type, market, request=request
    )
    context = {
        'result': [
            {'query': query, 'vaults': podcasts},
        ],
    }
    return render(request, 'searchPodcasts.html', context)



def members(request):
    if request.method == 'POST':
        return redirect('/members/' + request.POST.get('query', ''))
    members_list = user_client.search(request=request)
    return render(request, 'members.html', {'membersList': members_list})


def members_search(request, query):
    if request.method == 'POST':
        return redirect('/members/' + request.POST.get('query', ''))
    accounts = user_client.search(query, request=request)
    context = {
        'result': [
            {'query': query, 'members': accounts},
            {'query': query, 'members': []},
        ],
    }
    return render(request, 'searchMembers.html', context)



def all_search(request, query):
    if request.method == 'POST':
        return redirect('/search/' + request.POST.get('query', ''))

    artists = artist_client.search(query, request=request)
    podcasts = podcast_client.search(query, request=request)
    albums = album_client.search(query, request=request)
    members = user_client.search(query,request=request)
    context = {
        'result': [
            {'query': query, 'vaults': artists},
            {'query': query, 'vaults': albums},
            {'query': query, 'vaults': podcasts},
            {'query': query, 'members': members}, 
        ]
    }
    return render(request, 'searchResult.html', context)



def vault(request, vtype, id):
    if request.method == 'POST':
        review_client.create(
            content=request.POST.get('title'),
            rating=request.POST.get('rating'),
            subject_type=vtype,
            subject_id=id,
            request=request,
        )
        return redirect(request.path)

    if vtype == 'artist':
        artist = artist_client.get(id, request=request)
        context = {}
        if artist is not None:
            context['vault'] = {
                'type': 'artist',
                'title': artist['artist'],
                'spotifyimg': artist['image'],
                'id': id,
                'authors': [{'name': artist['artist'], 'image': artist['image']}],
            }
    elif vtype == 'podcast':
        podcast = podcast_client.get(id, request=request)
        context = {}
        if podcast is not None:
            context['vault'] = {
                'type': 'podcast',
                'title': podcast['show'],
                'spotifyimg': podcast['image'],
                'id': id,
                'description': podcast['description'],
                'total_tracks': podcast['total_episodes'], 
                'external_url': podcast['external_url'],
                'authors': [{'name': podcast['publisher'], 'image': podcast['image']}],
            }
    elif vtype == 'album':
        album = album_client.get(id, request=request)
        context = {}
        if album is not None:
            author = album['artists'][0] if album['artists'] else ''
            author_image = ''
            if author:
                artist = artist_client.get(author, request=request)
                if artist is not None:
                    author_image = artist['image']
            context['vault'] = {
                'type': 'album',
                'title': album['album'],
                'spotifyimg': album['image'],
                'id': id,
                'date': album['date'],
                'total_tracks': album['total_tracks'],
                'authors': [{'name': author, 'image': author_image}],
            }
    else:
        context = api_client.get_json(f'/api/vaults/{vtype}/{id}', request=request, default={}) or {}

    posts = review_client.list_for(vtype, id, request=request)
    counts = comment_client.counts_by_subject(request=request)
    for post in posts:
        post['comment_count'] = counts.get(str(post['post']['id']), 0)
    ratings = [p['post']['rating'] for p in posts if isinstance(p['post']['rating'], int)]
    current_id = str(request.user.id) if request.user.is_authenticated else None
    already_reviewed = bool(current_id) and any(
        p.get('author_id') == current_id for p in posts
    )

    context.update({
        'vault_id': id,
        'is_post': True,
        'path': request.path,
        'posts': posts,
        'rating': round(sum(ratings) / len(ratings)) if ratings else 0,
        'first_post': not already_reviewed,
    })
    return render(request, 'vault.html', context)


def vault_post(request, vtype, id, post_id):
    if request.method == 'POST':
        if request.user.is_authenticated:
            answer_id = request.POST.get('comment_answer_id')
            parent_comment_id = answer_id if answer_id and answer_id != '0' else None
            comment_client.create(
                content=request.POST.get('content'),
                review_id=post_id,
                created_by=request.user.id,
                parent_comment_id=parent_comment_id,
                request=request,
            )
        return redirect(request.path)

    review = review_client.get(post_id, request=request)
    comments = comment_client.list_for(post_id, request=request)
    context = {
        'comments': comments,
        'comment_count': len(comments),
        'is_post': False,
        'path': request.path,
    }
    if review is not None:
        context['post'] = review['post']
        context['post_user'] = review['user']
        context['is_liked'] = review['is_liked']
    return render(request, 'post.html', context)



@login_required_api
def follow(request):
    if request.method == 'POST':
        username = request.POST.get('user')
        target = user_client.get_by_username(username, request=request)
        if target is not None and target.get('id') is not None:
            user_client.toggle_follow(
                target['id'], request.user.id, request=request
            )
        return redirect('/profile/' + username)
    return redirect('home')


@login_required_api
def like_or_unlike_post(request):
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        path = request.POST.get('path', '/')
        api_client.post(f'/api/posts/{post_id}/like', request=request)
        return redirect(path)
    return redirect('home')


@login_required_api
def like_or_unlike_comment(request):
    if request.method == 'POST':
        comment_id = request.POST.get('comment_id')
        path = request.POST.get('path', '/')
        comment_client.toggle_like(comment_id, request.user.id, request=request)
        return redirect(path)
    return redirect('home')
