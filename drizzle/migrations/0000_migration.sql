-- Restore pieces a project copy does not carry over: the signup trigger and the store settings row.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, email)
select u.id, left(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'), 120), u.email
from auth.users u
on conflict (id) do nothing;

insert into public.store_settings (id, delivery_fee, free_delivery_threshold, delivery_cities, announcement_fr, announcement_ar)
values (true, 7, 150,
  array['Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja','Jendouba','Le Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan','Kasserine','Sidi Bouzid','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili'],
  'Paiement à la livraison partout en Tunisie',
  'الدفع عند الاستلام في كامل تراب الجمهورية')
on conflict (id) do nothing;
