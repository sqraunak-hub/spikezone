"""Permission classes for the API.

REST_FRAMEWORK in settings.py sets DEFAULT_AUTHENTICATION_CLASSES but no
DEFAULT_PERMISSION_CLASSES, so DRF falls back to AllowAny. Any view that did
not name its own permission_classes was therefore writable by anyone on the
internet — the product catalogue, the blog, the categories and the user
profiles all were.

Rather than flipping the global default (which would have locked the public
catalogue reads the storefront depends on), each affected view now states what
it allows.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


def _is_admin(user):
    # The project's User model carries `is_admin`; `is_staff` does not exist
    # on it, so Django's own IsAdminUser cannot be used here.
    return bool(user and user.is_authenticated and getattr(user, "is_admin", False))


class IsAdminOrReadOnly(BasePermission):
    """Anyone may read; only an admin may create, change or delete.

    This is what the catalogue, categories and blog need: the storefront reads
    them anonymously and never writes to them.
    """

    message = "Only an administrator can change this."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return _is_admin(request.user)


class IsAdminUser(BasePermission):
    """Admin only, for both reads and writes."""

    message = "Administrator access required."

    def has_permission(self, request, view):
        return _is_admin(request.user)


class IsSelfOrAdmin(BasePermission):
    """A user may act on their own row; an admin may act on any.

    Used for the profile endpoint, which previously let an anonymous caller
    read, edit or delete any account by id.
    """

    message = "You can only access your own account."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if _is_admin(request.user):
            return True
        # the object here is a User row
        return getattr(obj, "pk", None) == request.user.pk


class CreateOnlyOrAdmin(BasePermission):
    """Anyone may submit; only an admin may list, edit or delete.

    The contact form has to accept anonymous POSTs, but the submissions carry
    customer names, emails and phone numbers and were readable by anyone.
    """

    message = "Only an administrator can view or change submissions."

    def has_permission(self, request, view):
        if request.method == "POST":
            return True
        return _is_admin(request.user)
