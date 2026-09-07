from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.utils.text import slugify
from django.utils import timezone
import datetime
import html
import re

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, contact, address="", state="", city="", postalcode="", is_active=True, is_admin=False, password=None, phone=None):

        if not email:
            raise ValueError('Email Required')

        user = self.model(
            email=self.normalize_email(email),
            name=name,
            contact=contact,
            phone=phone,
            address=address,
            state=state,
            city=city,
            postalcode=postalcode,
        )

        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_phone_user(self, phone, name="", email=None):
        """
        Create an account for someone who arrived via OTP and has no password.

        `email` is the USERNAME_FIELD and has to be unique, but a phone-first
        user has not given us one yet, so we mint a placeholder in a domain we
        control and never send mail to. The storefront prompts for a real
        address on first login and PATCHes it in.

        set_unusable_password() matters: without it the password hash is empty
        string, and Django treats an empty hash as "never matches" only by
        accident. The explicit unusable marker is what makes authenticate()
        refuse to log this account in with a blank password.
        """
        placeholder = email or 'u%s@phone.spikezone.in' % phone.lstrip('+')
        user = self.model(
            email=self.normalize_email(placeholder),
            name=name or '',
            contact=phone,
            phone=phone,
        )
        user.set_unusable_password()
        user.save(using=self.db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='Email', 
        max_length=255,
        unique=True
    )
    name = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    # `contact` is whatever the user typed at signup - free text, never checked.
    # `phone` is different: it is only ever written after an OTP provider has
    # confirmed the number, and it is always E.164 (+919876543210). Login by
    # phone matches on this field alone. Matching on `contact` would let anyone
    # who signs up quoting someone else's number capture that person's account
    # the moment they log in by OTP.
    # Nullable because every pre-existing account has no verified number yet;
    # MySQL allows many NULLs under a UNIQUE index, so this stays enforceable.
    phone = models.CharField(
        max_length=20, unique=True, null=True, blank=True, db_index=True
    )
    address = models.CharField(max_length=999, default='', null=True, blank=True)
    state = models.CharField(max_length=50, default='', null=True, blank=True)
    city = models.CharField(max_length=50, default='', null=True, blank=True)
    postalcode = models.CharField(max_length=10, default='', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'contact']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin


class Category(models.Model):
    category_id = models.CharField(max_length=50)
    category_name = models.CharField(max_length=50)
 

class Products(models.Model):
    product_sku = models.CharField(max_length=50)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    inStock = models.BooleanField(default=True)
    isBest = models.BooleanField(default=False)
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=255)  # Slug must be set manually
    image1 = models.ImageField(upload_to="media/", null=True, blank=True)
    image2 = models.ImageField(upload_to="media/", null=True, blank=True)
    image3 = models.ImageField(upload_to="media/", null=True, blank=True)
    image4 = models.ImageField(upload_to="media/", null=True, blank=True)
    image5 = models.ImageField(upload_to="media/", null=True, blank=True)
    price = models.CharField(max_length=50)
    max_price = models.CharField(max_length=50)
    short_desc = models.CharField(max_length=500)
    long_desc = models.CharField(max_length=9999)
    bullet_one = models.CharField(max_length=500)
    bullet_two = models.CharField(max_length=500, null=True, blank=True)
    bullet_three = models.CharField(max_length=500, null=True, blank=True)
    bullet_four = models.CharField(max_length=500, null=True, blank=True)
    bullet_five = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.title
    
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum([r.rating for r in reviews]) / reviews.count(), 2)
        return None

class Address(models.Model):
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)

    def __str__(self):
        return f"Address {self.id} for {self.user.username}"

class Order(models.Model):
    DELIVERY_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    pay_method = models.CharField(max_length=255)
    order_date = models.DateTimeField(auto_now_add=True)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    delivery_status = models.CharField(
        max_length=20, 
        choices=DELIVERY_STATUS_CHOICES,
        default='pending'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )

    def __str__(self):
        return f"Order {self.id} by {self.user.name} - {self.delivery_status}"
    
    @property
    def total_amount(self):
        return sum(
            float(item.product.price) * item.quantity 
            for item in self.items.all()
        )

    def __str__(self):
        return f"Order {self.id} by {self.user.name} - {self.delivery_status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.title} (x{self.quantity})"

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contact from {self.name} - {self.subject}"

class Review(models.Model):
    product = models.ForeignKey(Products, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    order = models.ForeignKey(Order, related_name='reviews', on_delete=models.CASCADE, null=True, blank=True)
    rating = models.PositiveIntegerField()
    review_text = models.TextField(null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.name} for {self.product.title} - {self.rating} stars"
    
class Gallery(models.Model):
    image = models.ImageField(upload_to="gallery/")
    image_title = models.CharField(max_length=255)
    image_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image_title    
    
from django.utils.text import slugify

class Blog(models.Model):
    DRAFT = "draft"
    PUBLISHED = "published"
    STATUS_CHOICES = [(DRAFT, "Draft"), (PUBLISHED, "Published")]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)  # <-- Add this line
    content = models.TextField()

    # Shown on the blog list and as the og:image; the editor already uploads
    # into blog/ via BlogImageUploadView, so keep the same folder.
    featured_image = models.ImageField(upload_to="blog/", null=True, blank=True)

    # Card copy. Falls back to the start of content when left empty, so an
    # existing post without one still renders a sensible card.
    excerpt = models.CharField(max_length=300, blank=True, default="")

    # Google truncates around 160 characters; the generator for the content
    # pages trims to the same limit.
    meta_description = models.CharField(max_length=160, blank=True, default="")

    # Existing rows must stay visible, so published is the default.
    status = models.CharField(max_length=10, choices=STATUS_CHOICES,
                              default=PUBLISHED)

    # SET_NULL rather than CASCADE: deleting the admin account must not take
    # the posts with it.
    author = models.ForeignKey(User, related_name="blogs", null=True,
                               blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_published(self):
        return self.status == self.PUBLISHED

    def display_excerpt(self):
        """Card text, whether or not the author wrote one."""
        if self.excerpt:
            return self.excerpt
        plain = re.sub(r"<[^>]+>", " ", self.content or "")
        plain = html.unescape(plain)
        plain = re.sub(r"\s+", " ", plain).strip()
        return plain[:200].rstrip() + ("..." if len(plain) > 200 else "")

    def display_meta_description(self):
        if self.meta_description:
            return self.meta_description
        return self.display_excerpt()[:160].rstrip()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
class EmailOTP(models.Model):
    # What the code is allowed to do once verified. A code mailed out to
    # confirm an address during signup must not be replayable against the
    # passwordless-login endpoint, so the purpose is part of the lookup.
    PURPOSE_VERIFY = 'verify'
    PURPOSE_LOGIN = 'login'
    PURPOSE_CHOICES = [
        (PURPOSE_VERIFY, 'Email verification'),
        (PURPOSE_LOGIN, 'Passwordless login'),
    ]

    MAX_ATTEMPTS = 5

    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=10, choices=PURPOSE_CHOICES, default=PURPOSE_VERIFY
    )
    # A code is good for exactly one successful verification. Without this the
    # same six digits stayed valid for the rest of the five-minute window, so
    # anyone who saw them once (shoulder-surf, a forwarded mail, a proxy log)
    # could replay them.
    is_used = models.BooleanField(default=False)
    # Six digits is a 1-in-a-million guess, which is fine against one attempt
    # and useless against a hundred thousand. The counter caps the guesses per
    # issued code rather than relying on request throttling alone.
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Every lookup is "newest code for this address and purpose".
        # Named explicitly so it matches the hand-written migration; letting
        # Django autogenerate the name would make makemigrations want to
        # rewrite the index on the next run.
        indexes = [
            models.Index(
                fields=['email', 'purpose', '-created_at'],
                name='emailotp_lookup_idx',
            )
        ]

    # Ten minutes, because that is what the mail the customer is holding says.
    # Any change here has to change the copy in auth_views.send_otp_email too,
    # or the code dies while the mail still claims it is good.
    VALID_FOR = datetime.timedelta(minutes=10)

    def is_expired(self):
        return timezone.now() > self.created_at + self.VALID_FOR

    def is_usable(self):
        return not self.is_used and self.attempts < self.MAX_ATTEMPTS and not self.is_expired()

    def __str__(self):
        return f"{self.email} - {self.purpose}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, related_name='wishlists', on_delete=models.CASCADE)
    product = models.ForeignKey(Products, related_name='wishlisted_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.title}"