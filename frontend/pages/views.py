"""Page views for the HexaTuneVault frontend.

Each view is a thin layer: fetch data from the NestJS REST API via
``api_client`` and render an existing template with it. No database, no ORM,
no Django auth. Pure-frontend routing logic (search/filter redirects) is kept
from the original project since it has no backend dependency.

NOTE: the ``/api/...`` paths below are the contract this frontend expects from
the NestJS API; adjust them as the API is built. Until the API exists,
``api_client`` returns falsy defaults and the templates still render (empty).
"""

from functools import wraps

from django.conf import settings
from django.contrib import messages
from django.shortcuts import redirect, render

from . import api_client


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
        timeline = api_client.get_json('/api/feed/timeline', request=request, default=[])
    return render(request, 'home.html', {'timeline': timeline})



def signin(request):
    if request.method == 'POST':
        response = api_client.post('/api/auth/login', json={
            'username': request.POST.get('username'),
            'password': request.POST.get('password'),
        })
        if response is not None and response.ok:
            token = response.json().get('token')
            return _set_token_cookie(redirect('home'), token)
        messages.info(request, 'Invalid username or password')
        return redirect('login')
    return render(request, 'login.html')


def signup(request):
    if request.method == 'POST':
        if request.POST.get('password') != request.POST.get('password2'):
            messages.info(request, 'Password not matching')
            return redirect('create_account')

        is_artist = request.POST.get('isArtist') == 'on'
        payload = {
            'username': request.POST.get('username'),
            'email': request.POST.get('email'),
            'password': request.POST.get('password'),
            'isArtist': is_artist,
            'link': request.POST.get('link', ''),
        }
        response = api_client.post('/api/auth/register', json=payload)
        if response is not None and response.ok:
            token = response.json().get('token')
            return _set_token_cookie(redirect('profile'), token)

        # Surface the API's validation message when available.
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

    context = api_client.get_json(
        f'/api/users/{user}/profile', request=request, default={}
    ) or {}
    context['isCurrentUser'] = (user == request.user.username)
    return render(request, 'profile.html', context)


@login_required_api
def settings_profile(request):
    if request.method == 'POST':
        data = {
            'bio': request.POST.get('bio', ''),
            'location': request.POST.get('location', ''),
        }
        files = {}
        if request.FILES.get('image'):
            image = request.FILES['image']
            files['image'] = (image.name, image.read(), image.content_type)
        api_client.post('/api/users/me/settings', request=request, data=data, files=files or None)
        return redirect('settings')

    context = api_client.get_json('/api/users/me/settings', request=request, default={}) or {}
    return render(request, 'settingsProfile.html', context)



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
    params = {
        'q': query,
        'genre': request.GET.get('genre'),
        'album_type': request.GET.get('album_type'),
        'market': request.GET.get('market'),
    }
    context = api_client.get_json('/api/music/search', request=request, params=params, default={}) or {}
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
    params = {
        'q': query,
        'explicit': request.GET.get('explicit'),
        'media_type': request.GET.get('media_type'),
        'market': request.GET.get('market'),
    }
    context = api_client.get_json('/api/podcasts/search', request=request, params=params, default={}) or {}
    return render(request, 'searchPodcasts.html', context)



def members(request):
    if request.method == 'POST':
        return redirect('/members/' + request.POST.get('query', ''))
    context = api_client.get_json('/api/members/recommended', request=request, default={}) or {}
    return render(request, 'members.html', context)


def members_search(request, query):
    if request.method == 'POST':
        return redirect('/members/' + request.POST.get('query', ''))
    context = api_client.get_json(
        '/api/members/search', request=request, params={'q': query}, default={}
    ) or {}
    return render(request, 'searchMembers.html', context)



def all_search(request, query):
    if request.method == 'POST':
        return redirect('/search/' + request.POST.get('query', ''))
    params = {'q': query, 'market': request.GET.get('market')}
    context = api_client.get_json('/api/search', request=request, params=params, default={}) or {}
    return render(request, 'searchResult.html', context)



def vault(request, vtype, id):
    if request.method == 'POST':
        api_client.post(f'/api/vaults/{vtype}/{id}/posts', request=request, data={
            'title': request.POST.get('title'),
            'rating': request.POST.get('rating'),
        })
        return redirect(request.path)

    context = api_client.get_json(f'/api/vaults/{vtype}/{id}', request=request, default={}) or {}
    context.update({
        'vault_id': id,
        'is_post': True,
        'path': request.path,
    })
    return render(request, 'vault.html', context)


def vault_post(request, vtype, id, post_id):
    if request.method == 'POST':
        api_client.post(f'/api/posts/{post_id}/comments', request=request, data={
            'content': request.POST.get('content'),
            'comment_answer_id': request.POST.get('comment_answer_id'),
        })
        return redirect(request.path)

    context = api_client.get_json(f'/api/posts/{post_id}', request=request, default={}) or {}
    context.update({
        'is_post': False,
        'path': request.path,
    })
    return render(request, 'post.html', context)



@login_required_api
def follow(request):
    if request.method == 'POST':
        user = request.POST.get('user')
        api_client.post(f'/api/users/{user}/follow', request=request)
        return redirect('/profile/' + user)
    return redirect('home')


@login_required_api
def fav_or_unfav_vault(request):
    if request.method == 'POST':
        vault_id = request.POST.get('vault_id')
        vtype = request.POST.get('vtype')
        vault_id_path = request.POST.get('vault_id_path')
        api_client.post(f'/api/vaults/{vault_id}/favourite', request=request)
        return redirect('/vault/' + vtype + '/' + vault_id_path)
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
        api_client.post(f'/api/comments/{comment_id}/like', request=request)
        return redirect(path)
    return redirect('home')
