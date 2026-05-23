from datetime import datetime, timedelta, date

from spotipy.oauth2 import SpotifyClientCredentials
import spotipy
import json
import uuid
import hashlib
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from spotipy.oauth2 import SpotifyOAuth
from .models import Vault, FollowersCount
from dotenv import load_dotenv
from .models import Comment, Post, Profile, VaultFavs, User, likedComments, likedPosts
from requests.exceptions import ReadTimeout
import re

load_dotenv()

auth_manager = SpotifyClientCredentials()
sp = spotipy.Spotify(auth_manager=auth_manager, requests_timeout=10, retries=10)


def get_artist(id):
    result = sp.artist(id)
    return result


def verify_artist(url):
    # given a spotify url, uses regex to find the id of the artist and then
    # verifies if the artist exists in spotify
    # example url: https://open.spotify.com/artist/7jy3rLJdDQY21OgRLCZ9sD?si=bWz-CxINQQeKfQfhHdbg3Q
    # the id is 7jy3rLJdDQY21OgRLCZ9sD

    regex = r"artist\/([a-zA-Z0-9]+)"
    matches = re.search(regex, url)

    if matches == None:
        return False

    id = matches.group(1)

    try:
        get_artist(id)
        return True
    except spotipy.SpotifyException:
        return False


# se podrían pasar codigos de error para que el front los maneje
def get_result_search(search, type, limit, offset, genre=None, album_type=None, explicit=None, market=None, media_type=None):
    if market is None:
        market = 'US'
    if ((
            type != "artist" and type != "album" and type != "playlist" and type != "track" and type != "show" and type != "episode" and type != "audiobook" and type != "member_common" and type != "member_artist") or limit < 0 or offset < 0):
        return json.dumps({'error': 'Tipo de busqueda no valida'})

    elif (type == "member_artist" or type == "member_common"):
        listToRet = []
        total = 0
        offset_copy = offset
        next = False
        next_flag = False
        finished = False
        filterArtist = type == "member_artist"

        for profile in Profile.objects.all():
            if (not filterArtist or profile.isArtist) and (search in profile.user.get_username()):
                if offset_copy == 0:
                    listToRet.append(get_profile(profile.user.get_username()))
                else:
                    offset_copy -= 1
                if finished:
                    next_flag = True
                else:
                    total += 1
            if not finished and total >= limit:
                finished = True
            if next_flag:
                break

        jsonResult = {
            'type': type,
            'members': listToRet,
            'total': total,
            'next': next,
            'query': search
        }

    else:
        while True:
            try:
                result = sp.search(search, limit, offset, type, market)
                break
            except ReadTimeout:
                pass

        listToRet = []
        if result[type + 's']['items'] == []:
            return json.dumps({'error': 'No se encontraron artistas'})
        for items in result[type + 's']['items']:
            if genre is not None:
                if type == 'album':
                    genres = []
                    artists = items.get('artists')
                    for artist in artists:
                        genres.append(sp.artist(artist.get('id')).get('genres'))
                else:
                    genres = items.get('genres')
                if genres:
                    for g in genres:
                        if genre in g:
                            if not items['images']:
                                queryResult = {
                                    'id': items['id'],
                                    type: items['name'],
                                    'image': 'https://f4.bcbits.com/img/a4139357031_10.jpg',
                                    'likes': get_vault_fav_count(
                                        Vault.objects.filter(external_url__contains=items['id']).first())
                                }
                            else:
                                queryResult = {
                                    'id': items['id'],
                                    type: items['name'],
                                    'image': items['images'][0]['url'],
                                    'likes': get_vault_fav_count(
                                        Vault.objects.filter(external_url__contains=items['id']).first())
                                }
                            listToRet.append(queryResult)
                            break

            elif album_type is not None:
                alb_type = items.get('album_type')
                if alb_type and album_type in alb_type:
                    if not items['images']:
                        queryResult = {
                            'id': items['id'],
                            type: items['name'],
                            'image': 'https://f4.bcbits.com/img/a4139357031_10.jpg',
                            'likes': get_vault_fav_count(
                                Vault.objects.filter(external_url__contains=items['id']).first())
                        }
                    else:
                        queryResult = {
                            'id': items['id'],
                            type: items['name'],
                            'image': items['images'][0]['url'],
                            'likes': get_vault_fav_count(
                                Vault.objects.filter(external_url__contains=items['id']).first())
                        }
                    listToRet.append(queryResult)
            elif explicit is not None or media_type is not None:
                explicit_type = items.get('explicit')
                explicit_boolean = False
                if explicit == 'true':
                    explicit_boolean = True
                if (explicit is None or (explicit_type is not None and explicit_type == explicit_boolean)) and (media_type is None or (media_type == items.get('media_type'))):
                    if not items['images']:
                        queryResult = {
                            'id': items['id'],
                            type: items['name'],
                            'image': 'https://f4.bcbits.com/img/a4139357031_10.jpg',
                            'likes': get_vault_fav_count(
                                Vault.objects.filter(external_url__contains=items['id']).first())
                        }
                    else:
                        queryResult = {
                            'id': items['id'],
                            type: items['name'],
                            'image': items['images'][0]['url'],
                            'likes': get_vault_fav_count(
                                Vault.objects.filter(external_url__contains=items['id']).first())
                        }
                    listToRet.append(queryResult)
            else:
                if not items['images']:
                    queryResult = {
                        'id': items['id'],
                        type: items['name'],
                        'image': 'https://f4.bcbits.com/img/a4139357031_10.jpg',
                        'likes': get_vault_fav_count(Vault.objects.filter(external_url__contains=items['id']).first())
                    }
                else:
                    queryResult = {
                        'id': items['id'],
                        type: items['name'],
                        'image': items['images'][0]['url'],
                        'likes': get_vault_fav_count(Vault.objects.filter(external_url__contains=items['id']).first())
                    }
                listToRet.append(queryResult)
        jsonResult = {
            'type': type,
            'vaults': listToRet,
            'total': result[type + 's']['total'],
            'next': result[type + 's']['next'],
            'query': search
        }

    return jsonResult


# para sección de música
def search_music(query, genre=None, album_type=None, market=None):
    searchArtist = get_result_search(query, 'artist', 10, 0, genre=genre, market=market)
    searchAlbum = get_result_search(query, 'album', 10, 0, genre=genre, album_type=album_type, market=market)
    result = [searchArtist, searchAlbum]
    return {'result': result}


# para seccion de podcast
def search_podcast(query, explicit=None, market=None, media_type=None):
    searchPodcast = get_result_search(query, 'show', 10, 0, market=market, explicit=explicit, media_type=media_type)
    searchEpisode = get_result_search(query, 'episode', 10, 0, market=market, explicit=explicit)
    result = [searchPodcast, searchEpisode]
    return {'result': result}


def search_member(query):
    searchCommon = get_result_search(query, 'member_common', 10, 0)
    searchArtist = get_result_search(query, 'member_artist', 10, 0)
    result = [searchCommon, searchArtist]
    return {'result': result}


# para barra de navegación
def search_all(query, results, market=None):
    searchArtist = get_result_search(query, 'artist', results, 0, market=market)
    searchAlbum = get_result_search(query, 'album', results, 0, market=market)
    searchPodcast = get_result_search(query, 'show', results, 0, market=market)
    searchEpisode = get_result_search(query, 'episode', results, 0, market=market)
    searchMemberCommon = get_result_search(query, 'member_common', results, 0, market=market)
    searchMemberArtist = get_result_search(query, 'member_artist', results, 0, market=market)
    result = [searchArtist, searchAlbum, searchPodcast, searchEpisode, searchMemberArtist, searchMemberCommon]
    return {'result': result}


def get_or_create_vault(item):
    try:
        toRet = Vault.objects.filter(id=item['id'])
    except:
        image = item['images'][0]['url']
        genre = item['genres']
        if (item['images'] == []):
            image = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
        elif (item['genres'] == []):
            genre = ['None']

        toRet = create_vault(item['id'], item['name'], item['external_urls']['spotify'], genre, image)
    return {
        'id': toRet.id,
        'title': toRet.title,
        'vtype': vtype,
        'description': toRet.description,
        'external_url': toRet.external_url,
        'genres': toRet.genres,
        'spotifyimg': toRet.spotifyimg,
        'rating': toRet.rating,
        'followers': toRet.followers,
        'likes': toRet.likes,
        'authors': json.decoder.JSONDecoder(toRet.authors),
        'total_tracks': toRet.total_tracks,
    }


def get_or_create_by_id(vtype, id):
    type = vtype.lower()
    str = type + id
    uuid_str = string_to_uuid(str)
    toRet = None
    if type == 'artist':
        item = sp.artist(id)
        try:
            Vault.objects.filter(id=uuid_str).update(spotifyimg=item['images'][0]['url'])
            toRet = Vault.objects.get(id=uuid_str)
        except:
            if (item['images'] == []):
                image = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
            else:
                image = item['images'][0]['url']
            if (item['genres'] == []):
                genre = ['None']
            else:
                genre = item['genres']
            artist = [{'name': item['name'], 'image': image}]
            toRet = create_vault(item['id'], type, item['name'], 'None', genre, image, item['external_urls']['spotify'],
                                 artist, 0, 'None')
    elif type == 'podcast':
        item = sp.show(id, None)
        try:
            Vault.objects.filter(id=uuid_str).update(spotifyimg=item['images'][0]['url'])
            toRet = Vault.objects.get(id=uuid_str)
        except:
            if (item['images'] == []):
                image = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
            else:
                image = item['images'][0]['url']
            publisher = [{'name': item['publisher'], 'image': image}]
            toRet = create_vault(item['id'], type, item['name'], item['description'], 'None', image,
                                 item['external_urls']['spotify'], publisher, item['total_episodes'], 'None')
    elif type == 'album':
        item = sp.album(id, None)
        try:
            Vault.objects.filter(id=uuid_str).update(spotifyimg=item['images'][0]['url'])
            toRet = Vault.objects.get(id=uuid_str)
        except:
            if (item['images'] == []):
                image_album = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
            else:
                image_album = item['images'][0]['url']
            if (item['genres'] == []):
                genre_album = ['None']
            else:
                genre_album = item['genres']
            artists = []
            for artist in item['artists']:
                artistInfo = sp.artist(artist['id'])
                if (artistInfo['images'] == []):
                    image_artist = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
                else:
                    image_artist = artistInfo['images'][0]['url']
                artists.append({'name': artist['name'], 'image': image_artist})
            toRet = create_vault(item['id'], type, item['name'], 'None', genre_album, image_album,
                                 item['external_urls']['spotify'], artists, item['total_tracks'], item['release_date'])
    elif type == 'episode':
        item = sp.episode(id, 'ES')
        try:
            Vault.objects.filter(id=uuid_str).update(spotifyimg=item['images'][0]['url'])
            toRet = Vault.objects.get(id=uuid_str)
        except:
            if (item['images'] == []):
                image_episode = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
            else:
                image_episode = item['images'][0]['url']
            if (item['show']['images'] == []):
                image_publisher = 'https://f4.bcbits.com/img/a4139357031_10.jpg'
            else:
                image_publisher = item['show']['images'][0]['url']
            publisher = [{'name': item['show']['publisher'], 'image': image_publisher}]
            toRet = create_vault(id=item['id'], type=type, title=item['name'], description=item['description'],
                                 genres='None', spotifyimg=image_episode, external_url=item['external_urls']['spotify'],
                                 authors=publisher, total_tracks=item['duration_ms'] // 1000 // 60,
                                 date=item['release_date'])
    else:
        pass
    return {
        'id': toRet.id,
        'title': toRet.title,
        'type': type,
        'description': toRet.description,
        'external_url': toRet.external_url,
        'genres': json.loads(toRet.genres),
        'spotifyimg': toRet.spotifyimg,
        'rating': toRet.rating,
        'followers': toRet.followers,
        'likes': toRet.likes,
        'authors': json.loads(toRet.authors),
        'total_tracks': toRet.total_tracks,
        'date': toRet.date,
    }


def get_following_latest_posts(request):
    current_user = request.user.username

    limit_date = date.today() - timedelta(days=7)

    posts_list = []
    followers = FollowersCount.objects.filter(follower=current_user)
    for follower in followers:
        posts = Post.objects.filter(user=follower.user).values()
        for post in posts:
            if post['date'] > limit_date:
                vault_data = Vault.objects.filter(external_url__contains=post['vault_id']).values()
                if len(post['title']) > 40:
                    content_preview = post['title'][:37]
                    content_preview += '...'
                else:
                    content_preview = post['title']
                post_formated = {
                    'post_id': post['id'],
                    'content': content_preview,
                    'date': post['date'],
                    'user': post['user'],
                    'rating': post['rating'],
                    'vault_id': post['vault_id'],
                    'vault_name': vault_data[0]['title'],
                    'vault_image': vault_data[0]['spotifyimg'],
                    'vault_vtype': vault_data[0]['vtype']
                }
                posts_list.append(post_formated)

    posts_list.sort(key=lambda x: x['date'], reverse=True)

    return {'timeline': posts_list}


def get_album_item(id):
    pass


def get_top50_artists_deprecated(offset):
    playlists = sp.playlist_tracks("37i9dQZF1DXcBWIGoYBM5M", None, 8, offset)  # top50 playlist id
    list = []
    for item in playlists['items']:
        if (item['track']['artists'] not in list):
            list.append(item['track']['artists'])
    return list

def get_top50_artists(offset):
    topArtistsUrls = scrap_artists(50)
    artists = sp.artists(topArtistsUrls)
    return artists

def scrap_artists(limit):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=true")
    browser = webdriver.Chrome(options=options)
    browser.get("https://charts.spotify.com/home")
    browser.implicitly_wait(5)
    button = browser.find_element(By.XPATH, '//*[@id="__next"]/div/div/main/div[2]/div/section[3]/div/div[1]/ul/li[3]/button')
    button.send_keys(Keys.RETURN)
    urlList=[]
    elem= browser.find_elements(By.XPATH,'//*[@class="ChartsHomeEntries__StyledCover-kmpj2i-8 gqKcxZ"]/a')
    i=0
    for e in elem:
        urlList.append(e.get_attribute('href').split('/')[-1])
        i+=1
        if i==limit:
            break

    browser.quit()
    return urlList


def format_top50(offset):
    # formats data from get_top50_artists() in the following way
    # {
    #     'id_artist_1': {
    #         'artist': 'artist',
    #         'image': 'artistimg',
    #         'likes': 0
    #     },
    #     'id_artist_2': {
    #         'artist': 'artist',
    #         'image': 'artistimg',
    #         'likes': 0
    #     },
    #     }
    # }
    top50_dict = {}
    isLastPage = False
    while (len(top50_dict) < 9):
        top50_list = get_top50_artists(offset)
        if (len(top50_list) < 9):
            islastPage = True
        for artist in top50_list['artists']:
            if artist['id'] not in top50_dict:
                    top50_dict[artist['id']] = {
                        'artist': artist['name'],
                        'image': artist['images'][0]['url'],
                        'likes': get_vault_fav_count(
                            Vault.objects.filter(external_url__contains=artist['id']).first())
                    }
    return {'top': top50_dict, 'isLastPage': isLastPage}


def create_vault(id, type, title, description, genres, spotifyimg, external_url, authors, total_tracks, date):
    str = type.lower() + id
    uuid_str = string_to_uuid(str)
    vaultToRet = Vault(id=uuid_str, vtype=type, title=title, description=description, genres=json.dumps(genres),
                       spotifyimg=spotifyimg, rating=0, followers=0, likes=0, external_url=external_url,
                       authors=json.dumps(authors), total_tracks=total_tracks, date=date)
    vaultToRet.save()
    return vaultToRet


def string_to_uuid(input_string):
    # Hash the input string using SHA-256
    sha256_hash = hashlib.sha256(input_string.encode()).hexdigest()

    # Take the first 32 characters of the hash (128 bits)
    hash_32_chars = sha256_hash[:32]

    # Convert the 32-character hexadecimal string to UUID format
    uuid_string = '-'.join([
        hash_32_chars[:8],  # First 8 characters
        hash_32_chars[8:12],  # Next 4 characters
        hash_32_chars[12:16],  # Next 4 characters
        hash_32_chars[16:20],  # Next 4 characters
        hash_32_chars[20:]  # Last 12 characters
    ])

    # Create a UUID from the formatted string
    try:
        uuid_param = uuid.UUID(uuid_string)
        return uuid_param
    except ValueError:
        # Handle the case where the string is not a valid UUID
        return None  # Or raise an error or handle it as needed


def getChainOfComments(post_id, request):
    comments = Comment.objects.filter(post_id=post_id)
    chain_comments = []

    for comment in comments:
        if comment.comment_answer_id == "0":
            chain_comments.append({'comment': comment, 'replies': [], 'replies_count': 0,
                                   'user': Profile.objects.get(user__username=comment.user),
                                   'likes': get_comment_likes_count(comment),
                                   'is_liked': is_comment_liked_by_current_user(request.user.username, comment)})

    for post in chain_comments:
        for comment in comments:
            if str(comment.comment_answer_id) == str(post['comment'].id):
                post['replies'].append(
                    {'comment': comment, 'user': Profile.objects.get(user__username=comment.user),
                     'likes': get_comment_likes_count(comment),
                     'is_liked': is_comment_liked_by_current_user(request.user.username, comment)})
                post['replies_count'] += 1

    return chain_comments


def getPostsWithCommentCount(vault_id, current_user):
    posts = Post.objects.filter(vault_id=vault_id)
    posts_with_count = []
    for post in posts:
        user = Profile.objects.get(user__username=post.user)
        likes = get_post_likes_count(post.id)
        is_liked = is_post_liked_by_current_user(current_user, post)
        posts_with_count.append({'post': post, 'comment_count': Comment.objects.filter(post_id=post.id).count(),
                                 'user': user, 'likes': likes, 'is_liked': is_liked})
    return posts_with_count


def getVaultRating(vault_id):
    posts = Post.objects.filter(vault_id=vault_id)
    sum = 0
    count = 0
    for post in posts:
        if post.rating != 0:
            sum += post.rating
            count += 1
    return round(sum / count, 1) if count != 0 else 0


def get_profile(user):
    profile = Profile.objects.get(user__username=user)
    profile_data = {
        'user': profile.user,
        'bio': profile.bio,
        'profileimg': profile.profileimg.url,
        'location': profile.location,
        'followers': profile.followers,
        'isArtist': profile.isArtist
    }
    return profile_data


def get_posts(user):
    posts = Post.objects.filter(user=user).values()
    postsToRet = []
    for post in posts:
        vault_data = Vault.objects.filter(external_url__contains=post['vault_id']).values()
        postFormated = {
            'post_id': post['id'],
            'content': post['title'],
            'date': post['date'],
            'rating': post['rating'],
            'likes': post['likes'],
            'vault_id': post['vault_id'],
            'vault_name': vault_data[0]['title'],
            'vault_image': vault_data[0]['spotifyimg'],
            'vault_vtype': vault_data[0]['vtype']
        }
        postsToRet.append(postFormated)
    return postsToRet


# conectar con spotify
def get_recommended_profiles():
    profiles = Profile.objects.all()
    recommended_profiles = []
    for profile in profiles:
        if (profile.isArtist):
            recommended_profiles.append(get_profile(profile.user))
        if len(recommended_profiles) == 12:
            break
    return {'membersList': recommended_profiles}


def get_user_vault_favs(user):
    vaults = VaultFavs.objects.filter(user=user).distinct()
    toret = {}
    for vault in vaults:
        auxvault = Vault.objects.get(external_url=vault)
        toret[auxvault.id] = {
            'artist': auxvault.title,
            'vtype': auxvault.vtype,
            'description': auxvault.description,
            'genres': auxvault.genres,
            'image': auxvault.spotifyimg,
            'likes': auxvault.likes,
            'id': auxvault.external_url.split('/')[-1]
        }
    return {'top': toret}


def get_vault_fav_count(vault_id):
    return VaultFavs.objects.filter(vault=vault_id).count()


def get_comment_likes_count(comment_id):
    return likedComments.objects.filter(comment=comment_id).count()


def get_post_likes_count(post_id):
    return likedPosts.objects.filter(post=post_id).count()


def is_post_liked_by_current_user(user, post):
    return likedPosts.objects.filter(user=user, post=post).exists()


def is_comment_liked_by_current_user(user, comment):
    return likedComments.objects.filter(user=user, comment=comment).exists()


# se podría scrapear de algun lugar para tener un top
def get_top_podcasts(limit=10):
    topPodcastsUrls = scrap_podcasts(limit)

    podcasts = sp.shows(topPodcastsUrls)
    podcastsfiltered = podcasts['shows']
    podcast_data = {}
    for podcast in podcastsfiltered:
        podcast_data[podcast['id']] = {
            'artist': podcast['name'],
            'image': podcast['images'][0]['url'],
            'likes': get_vault_fav_count(Vault.objects.filter(external_url__contains=podcast['id']).first())
        }

    return {'top': podcast_data}


def scrap_podcasts(limit):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=true")
    browser = webdriver.Chrome(options=options)
    browser.get("https://podcastcharts.byspotify.com/latam")
    browser.implicitly_wait(5)
    urlList = []
    elem = browser.find_elements(By.XPATH,
                                 '//div[@class="flex"]/div[@class="relative uppercase text-accent0 font-normal mr-4 flex justify-center items-center cursor-pointer"]/a')
    i = 0
    for e in elem:
        urlList.append(e.get_attribute('href').split('/')[-1])
        i += 1
        if i == limit:
            break

    browser.quit()
    return urlList

def get_user_followers(user):
    followers = FollowersCount.objects.filter(user=user).distinct()
    toret = []
    for follower in followers:
        aux =Profile.objects.get(user__username=follower.follower)
        toret.append({'username': follower.follower, 'img': aux.profileimg.url, 'is_artist': aux.isArtist })
    return {'followers': toret}


def get_user_following(user):
    following = FollowersCount.objects.filter(follower=user).distinct()
    toret = []
    for follow in following:
        aux =Profile.objects.get(user__username=follow.user)
        toret.append({'username': follow.user, 'img': aux.profileimg.url, 'is_artist': aux.isArtist })
    return {'following': toret}