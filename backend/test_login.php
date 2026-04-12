$req = \Illuminate\Http\Request::create('/api/login', 'POST', ['email' => 'owner@tokosync.local', 'password' => 'password123']);
$res = app()->handle($req);
dump($res->getStatusCode());
dump($res->getContent());
