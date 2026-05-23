from django import forms
from .models import Post, Comment


class PostForm(forms.ModelForm):
    title = forms.CharField(
        label='',
        widget=forms.Textarea(attrs={
            'rows': '2',
            'placeholder': 'Say Something...'
            }))

    class Meta:
        model = Post
        fields = ['title', 'rating']


class CommentForm(forms.ModelForm):
    content = forms.CharField(
        label='',
        widget=forms.Textarea(attrs={
            'rows': '2',
            'placeholder': 'Reply to this post...',
    }))

    comment_answer_id = forms.CharField(
        label='',
    )
    
    class Meta:
        model = Comment
        fields = ['content', 'comment_answer_id']