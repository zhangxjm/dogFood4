from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import LeaderProfile, Address

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            phone='13800138000'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.phone, '13800138000')
        self.assertEqual(user.role, 'user')
        self.assertTrue(user.check_password('testpass123'))

    def test_create_leader(self):
        leader = User.objects.create_user(
            username='testleader',
            password='testpass123',
            phone='13800138001',
            role='leader'
        )
        self.assertEqual(leader.role, 'leader')

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)


class LeaderProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='leader1',
            password='pass123',
            role='leader'
        )

    def test_create_leader_profile(self):
        profile = LeaderProfile.objects.create(
            user=self.user,
            community='测试小区',
            commission_rate=0.05
        )
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.community, '测试小区')
        self.assertEqual(profile.commission_rate, 0.05)
        self.assertEqual(profile.total_commission, 0)


class AddressModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user1',
            password='pass123'
        )

    def test_create_address(self):
        address = Address.objects.create(
            user=self.user,
            receiver_name='张三',
            receiver_phone='13800138000',
            province='北京',
            city='北京市',
            district='朝阳区',
            detail_address='测试地址123号',
            is_default=True
        )
        self.assertEqual(address.user, self.user)
        self.assertEqual(address.receiver_name, '张三')
        self.assertTrue(address.is_default)


class UserAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user1',
            password='testpass123',
            phone='13800138000'
        )
        self.leader = User.objects.create_user(
            username='leader1',
            password='testpass123',
            phone='13800138001',
            role='leader'
        )

    def test_register_user(self):
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'password': 'newpass123',
            'password2': 'newpass123',
            'phone': '13800138002'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)

    def test_register_user_password_mismatch(self):
        url = reverse('user-register')
        data = {
            'username': 'newuser2',
            'password': 'newpass123',
            'password2': 'different',
            'phone': '13800138003'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_password_too_short(self):
        url = reverse('user-register')
        data = {
            'username': 'newuser3',
            'password': '123',
            'password2': '123',
            'phone': '13800138004'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_me_unauthenticated(self):
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'user1')

    def test_update_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-update-profile')
        data = {
            'phone': '13900139000'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, '13900139000')

    def test_login(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'user1',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'user1',
            'password': 'wrongpass'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AddressAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user1',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.address = Address.objects.create(
            user=self.user,
            receiver_name='张三',
            receiver_phone='13800138000',
            province='北京',
            city='北京市',
            district='朝阳区',
            detail_address='测试地址123号',
            is_default=True
        )

    def test_list_addresses(self):
        url = reverse('address-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_address(self):
        url = reverse('address-list')
        data = {
            'receiver_name': '李四',
            'receiver_phone': '13900139000',
            'province': '上海',
            'city': '上海市',
            'district': '浦东新区',
            'detail_address': '另一个地址456号',
            'is_default': False
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.count(), 2)

    def test_get_default_address(self):
        url = reverse('address-default')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['receiver_name'], '张三')

    def test_address_belongs_to_user(self):
        other_user = User.objects.create_user(
            username='user2',
            password='testpass123'
        )
        other_address = Address.objects.create(
            user=other_user,
            receiver_name='王五',
            receiver_phone='13700137000',
            province='广东',
            city='广州市',
            district='天河区',
            detail_address='其他地址',
            is_default=True
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('address-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertNotEqual(response.data[0]['id'], other_address.id)
