from django.urls import path, include
from SpikeZoneApiApp.auth_views import (
    EmailOTPLoginRequestView,
    EmailOTPLoginVerifyView,
    PhoneLoginView,
    PhoneOTPRequestView,
)
from SpikeZoneApiApp.views import AdminUserListView, UserLoginView, ContactViewSet, BlogViewSet, GalleryViewSet, UserProfileView, UserRegistrationView, ProductView, ProductListView,  ProductDetailBySlugView, CategoryView, ProductDetailView, ProductUpdateDeleteView, CategoryUpdateDeleteView, UserProfileUpdateDeleteView, OrderViewSet, UserReviewsView, AddressViewSet, ReviewViewSet, update_seo_json, BlogImageUploadView, BlogDetailBySlugView, SendOTPView, VerifyOTPView, AdminAddReviewView, WishlistViewSet
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'contact', ContactViewSet, basename='contact')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'gallery', GalleryViewSet, basename='gallery')
router.register(r'blogs', BlogViewSet, basename='blog')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    # The access token lasts 60 minutes. Without this the admin panel
    # had no way to renew it, so every save after the first hour 401'd.
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('uploadCategory/', CategoryView.as_view(), name='category'),
    path('uploadProduct/',
         ProductView.as_view({'post': 'create'}), name='UploadProduct'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/update/<int:pk>/', ProductUpdateDeleteView.as_view(), name='product-update-delete'),
    path('categories/update/<int:pk>/', CategoryUpdateDeleteView.as_view(), name='category-update-delete'),
    path('profiles/update/<int:pk>/', UserProfileUpdateDeleteView.as_view(), name='profile-update-delete'),
    path('products/<int:pk>/', ProductDetailView.as_view()),
    path('products/<slug:slug>/', ProductDetailBySlugView.as_view(), 
         name='product-detail-by-slug'),
    path('addresses/<int:user_id>/', AddressViewSet.as_view({
        'get': 'list',
        'delete': 'destroy'
    }), name='user-addresses'),
    path('addresses/delete/<int:pk>/', AddressViewSet.as_view({
        'delete': 'destroy'
    }), name='address-delete'),
    path('orders/<int:pk>/verify_payment/', OrderViewSet.as_view({
        'post': 'verify_payment'
    }), name='verify-payment'),
    path('', include(router.urls)), 
    path('update-seo/', update_seo_json, name='update_seo_json'),
    path("blogUpload/", BlogImageUploadView.as_view()),
        path('blogs/<slug:slug>/', BlogDetailBySlugView.as_view(), name='blog-detail-by-slug'),
    # Signup email verification (existing flow, unchanged URLs).
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),

    # Passwordless login. Mobile goes through the configured OTP provider
    # (Firebase today); email is the free fallback and needs no provider.
    path('phone/request-otp/', PhoneOTPRequestView.as_view(), name='phone-request-otp'),
    path('phone/verify/', PhoneLoginView.as_view(), name='phone-verify'),
    path('email/request-otp/', EmailOTPLoginRequestView.as_view(), name='email-login-request-otp'),
    path('email/verify-login/', EmailOTPLoginVerifyView.as_view(), name='email-login-verify'),
    path('wishlist/<int:product_id>/', WishlistViewSet.as_view({'delete': 'destroy'}), name='wishlist-delete-by-product'),
    path('admin/add-review/', AdminAddReviewView.as_view(), name='admin-add-review'),
    path('user-reviews/', UserReviewsView.as_view(), name='user-reviews'),
    # Registered customers, for the admin panel's Users screen. Admin-only:
    # the payload is the whole customer base with phones and addresses.
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),









]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
