from django import forms
from django.forms import ModelForm

from .models import Message, ChatRoom


class ChatMessageCreateForm(ModelForm):
	class Meta:
		model = Message
		fields = ['msg_content']
		widgets = {
			'msg_content': forms.TextInput(attrs={
    			'placeholder': 'Type your message here...', 
       			'maxlength': '512',
        		'autofocus': True,
				'style': 'width: 400px;'
        	}),
		}
		labels = {
			'msg_content': '',
		}


class NewGroupChatForm(ModelForm):
	class Meta:
		model = ChatRoom
		fields = ['groupchat_name']
		widgets = {
			'groupchat_name': forms.TextInput(attrs={
				'placeholder': 'Enter group chat name...',
				'maxlength': '128',
				'autofocus': True,
				'style': 'width: 400px;'
			}),
		}
		labels = {
			'groupchat_name': '',
		}


class ChatRoomEditForm(ModelForm):
	class Meta:
		model = ChatRoom
		fields = ['groupchat_name']
		widgets = {
			'groupchat_name': forms.TextInput(attrs={
				'placeholder': 'Enter group chat name...',
				'maxlength': '128',
			}),
		}
		labels = {
			'groupchat_name': '',
		}
