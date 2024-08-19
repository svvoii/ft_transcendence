from django import forms
from django.forms import ModelForm

from .models import Message


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
