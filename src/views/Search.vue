.search-container { padding: 24px; min-height: 100%; background: #f8fafc; }
.search-header { margin-bottom: 32px; text-align: center; opacity: 0; transform:
translateY(20px); animation: fadeInUp 0.6s ease forwards; } @keyframes fadeInUp
{ to { opacity: 1; transform: translateY(0); } } .search-title { font-size:
32px; font-weight: 600; color: #1e293b; margin-bottom: 16px; background:
linear-gradient(120deg, #1e293b 0%, #334155 100%); -webkit-background-clip:
text; -webkit-text-fill-color: transparent; } .search-description { font-size:
16px; color: #64748b; max-width: 600px; margin: 0 auto; } .search-form {
max-width: 800px; margin: 0 auto 40px; padding: 32px; background: white;
border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); transition: all
0.3s ease; opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s
ease 0.2s forwards; } .search-form:hover { transform: translateY(-5px);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); } .upload-area { border: 2px dashed
#e2e8f0; border-radius: 12px; padding: 40px; text-align: center; cursor:
pointer; transition: all 0.3s ease; position: relative; overflow: hidden; }
.upload-area:hover { border-color: var(--el-color-primary); background:
rgba(var(--el-color-primary-rgb), 0.02); } .upload-area::before { content: '';
position: absolute; top: 0; left: 0; width: 100%; height: 100%; background:
radial-gradient(circle at center, rgba(var(--el-color-primary-rgb), 0.1) 0%,
transparent 70%); transform: scale(0); transition: transform 0.6s ease; }
.upload-area:hover::before { transform: scale(2); } .upload-icon { font-size:
48px; color: #94a3b8; margin-bottom: 16px; transition: all 0.3s ease; }
.upload-area:hover .upload-icon { color: var(--el-color-primary); transform:
scale(1.1); } .upload-text { font-size: 16px; color: #64748b; margin-bottom:
8px; } .upload-hint { font-size: 14px; color: #94a3b8; } .preview-image { width:
100%; max-width: 300px; height: auto; border-radius: 8px; margin: 24px auto;
display: block; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transition: all 0.3s
ease; } .preview-image:hover { transform: scale(1.02); box-shadow: 0 8px 24px
rgba(0, 0, 0, 0.15); } .search-button { width: 100%; height: 48px; margin-top:
24px; font-size: 16px; font-weight: 600; letter-spacing: 1px; background:
linear-gradient(90deg, var(--el-color-primary),
var(--el-color-primary-light-3)); border: none; position: relative; overflow:
hidden; } .search-button::before { content: ''; position: absolute; top: 0;
left: -100%; width: 100%; height: 100%; background: linear-gradient(120deg,
transparent, rgba(255, 255, 255, 0.3), transparent); transition: all 0.6s; }
.search-button:hover::before { left: 100%; } .search-button:hover { transform:
translateY(-2px); box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
} .search-button:active { transform: translateY(1px); } .results-container {
opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s ease 0.4s
forwards; } .results-grid { display: grid; grid-template-columns:
repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; margin-top: 32px; }
.result-card { background: white; border-radius: 12px; overflow: hidden;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; opacity:
0; transform: translateY(20px); } .result-card.show { animation: fadeInUp 0.6s
ease forwards; } .result-card:hover { transform: translateY(-5px) scale(1.02);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); } .result-image { width: 100%;
height: 200px; object-fit: cover; transition: all 0.3s ease; }
.result-card:hover .result-image { transform: scale(1.05); } .result-info {
padding: 16px; } .result-title { font-size: 16px; font-weight: 600; color:
#1e293b; margin-bottom: 8px; white-space: nowrap; overflow: hidden;
text-overflow: ellipsis; } .result-path { font-size: 14px; color: #64748b;
white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.similarity-score { position: absolute; top: 12px; right: 12px; background:
rgba(0, 0, 0, 0.6); color: white; padding: 4px 8px; border-radius: 12px;
font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); } /* Loading
Animation */ .loading-container { display: flex; justify-content: center;
align-items: center; min-height: 200px; } .loading-spinner { width: 40px;
height: 40px; border: 3px solid rgba(var(--el-color-primary-rgb), 0.1);
border-radius: 50%; border-top-color: var(--el-color-primary); animation: spin
1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } /*
Empty State */ .empty-state { text-align: center; padding: 48px 0; color:
#64748b; } .empty-icon { font-size: 64px; margin-bottom: 16px; color: #94a3b8; }
.empty-text { font-size: 16px; margin-bottom: 8px; } .empty-hint { font-size:
14px; color: #94a3b8; } /* 响应式调整 */ @media screen and (max-width: 768px) {
.search-container { padding: 16px; } .search-header { margin-bottom: 24px; }
.search-title { font-size: 24px; } .search-description { font-size: 14px; }
.search-form { padding: 24px; margin-bottom: 32px; } .upload-area { padding:
24px; } .upload-icon { font-size: 36px; } .results-grid { grid-template-columns:
repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; } .result-image { height:
160px; } }
