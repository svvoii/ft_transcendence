from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

from a_user.models import Account


class AccountAdmin(UserAdmin):
	# These properties will be display the following fields in the admin page (as columns)
	list_display = ('email', 'username', 'date_joined', 'last_login', 'is_admin', 'is_staff')

	# This will define the search fields in the admin page (when using the search bar)
	search_fields = ('email', 'username')

	# This will define the fields that can NOT be edited in the admin page (when clicking on a user)
	readonly_fields = ('id', 'date_joined', 'last_login')

	filter_horizontal = ()
	list_filter = ()
	fieldsets = ()

# Register the Account model with the custom AccountAdmin
admin.site.register(Account, AccountAdmin)

# This will remove the Group model from the admin page (we don't need it here)
admin.site.unregister(Group)
