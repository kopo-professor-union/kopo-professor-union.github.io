(() => {
 const config=window.UNION_BACKEND;
 const client=window.supabase.createClient(config.url,config.key);
 window.unionClient=client;
 const boardNames={notice:'공지사항',issue:'소식지·보도자료',news:'성명서',dataroom:'자료실',free:'자유 게시판'};
 window.unionPostLink=p=>p.remote?'article.html?id='+encodeURIComponent(p.id):'post-'+p.id+'.html';
 window.unionLoadPosts=async()=>{
  const response=await fetch('posts.json');if(!response.ok)throw Error('기존 글을 읽을 수 없습니다.');
  const stored=await response.json();
  const {data,error}=await client.from('union_posts').select('id,title,body,board,created_at,visibility,published').order('created_at',{ascending:false});
  if(error)throw Error('게시글 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  return [...(data||[]).map(p=>({id:p.id,remote:true,title:p.title,text:p.body,board:p.board,category:boardNames[p.board],date:p.created_at.slice(0,10).replaceAll('-','.'),visibility:p.visibility,published:p.published})),...stored];
 };
 window.unionProfile=async()=>{
  const {data:{user},error}=await client.auth.getUser();if(error||!user)return null;
  let {data:profile,error:readError}=await client.from('union_members').select('*').eq('id',user.id).maybeSingle();
  if(readError)throw Error('회원 정보를 읽을 수 없습니다.');
  if(!profile){const name=String(user.user_metadata?.display_name||'회원').slice(0,80);const result=await client.from('union_members').insert({id:user.id,display_name:name,role:'pending'}).select().single();if(result.error)throw Error('회원 승인 요청을 저장하지 못했습니다.');profile=result.data}
  return {...profile,user};
 };
 const area=document.createElement('a');area.href='login.html';area.className='account-link';area.textContent='로그인';document.querySelector('.search-link')?.before(area);
 client.auth.getSession().then(({data:{session}})=>{if(session){area.textContent='내 계정';area.href='login.html'}});
 client.auth.onAuthStateChange((_event,session)=>{area.textContent=session?'내 계정':'로그인'});
})();
