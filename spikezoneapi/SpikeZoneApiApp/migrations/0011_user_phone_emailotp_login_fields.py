from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds the verified-phone field used by OTP login, and hardens EmailOTP so a
    code can only be spent once and only for the purpose it was issued for.

    Hand-written rather than produced by makemigrations because the API's venv
    is not installed on this machine. It mirrors exactly what autodetect would
    emit for the model changes in the same commit; `makemigrations --check`
    should report no further changes.
    """

    dependencies = [
        ('SpikeZoneApiApp', '0010_alter_blog_options_blog_author_blog_excerpt_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='phone',
            field=models.CharField(
                blank=True, db_index=True, max_length=20, null=True, unique=True
            ),
        ),
        migrations.AddField(
            model_name='emailotp',
            name='purpose',
            field=models.CharField(
                choices=[('verify', 'Email verification'), ('login', 'Passwordless login')],
                default='verify',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='emailotp',
            name='is_used',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='emailotp',
            name='attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='emailotp',
            name='email',
            field=models.EmailField(db_index=True, max_length=254),
        ),
        migrations.AddIndex(
            model_name='emailotp',
            index=models.Index(
                fields=['email', 'purpose', '-created_at'],
                name='emailotp_lookup_idx',
            ),
        ),
    ]
