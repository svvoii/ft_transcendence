from django.http import Http404


class UnauthorizedAccessMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		return response

	def process_view(self, request, view_func, view_args, view_kwargs):
		# print(f'Request method: {request.method}')
		resolver_match = request.resolver_match

		# DEBUG #
		print(f'..Resolver_match: {resolver_match}')
		if resolver_match is None:
			print(f'..Resolver_match is None')
			return
		# # # # #
		if resolver_match.url_name is None:
			if 'static' in request.path or 'media' in request.path:
				print(f'..Allowing static or media files: {request.path}')
				return
			print(f'..404 - Page not found: {resolver_match.url_name}')
			raise Http404("Page not found")

		allowed_urls = ['js_home']

		if resolver_match.url_name not in allowed_urls and request.headers.get('X-Requested-With') != 'XMLHttpRequest':
			print(f'..404 - Page not found: {resolver_match.url_name}')
			raise Http404("Page not found")
