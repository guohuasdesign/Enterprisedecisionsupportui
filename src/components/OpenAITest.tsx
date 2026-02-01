// React component for testing OpenAI API connection
import React, { useState } from 'react';
import { testOpenAIConnection } from '../utils/testOpenAI';
import { OPENAI_API_KEY, isOpenAIConfigured } from '../config/openai';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function OpenAITest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const testResult = await testOpenAIConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = isOpenAIConfigured();
  const keyPrefix = isConfigured && OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set';

  return (
    <div className="p-6 bg-[#121821] border border-white/10 rounded-lg max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="text-[#4C8DFF]" size={20} />
        OpenAI API Connection Test
      </h2>

      {/* Configuration Status */}
      <div className="mb-4 p-4 bg-[#0B0F14] border border-white/5 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">API Key Configured:</span>
          <span className={`text-sm font-bold ${isConfigured ? 'text-green-400' : 'text-red-400'}`}>
            {isConfigured ? 'Yes' : 'No'}
          </span>
        </div>
        {isConfigured && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">API Key Prefix:</span>
            <span className="text-sm font-mono text-slate-300">{keyPrefix}</span>
          </div>
        )}
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={testing || !isConfigured}
        className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors"
      >
        {testing ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Testing Connection...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Test API Connection
          </>
        )}
      </button>

      {/* Test Results */}
      {result && (
        <div className={`mt-4 p-4 rounded border ${
          result.success 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div className="flex-1">
              <div className={`font-bold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.message}
              </div>
              
              {result.error && (
                <div className="text-sm text-red-300 mb-2">
                  Error: {result.error}
                </div>
              )}

              {result.details && (
                <div className="mt-3 space-y-2">
                  {result.details.model && (
                    <div className="text-xs text-slate-400">
                      Model: <span className="text-slate-300">{result.details.model}</span>
                    </div>
                  )}
                  {result.details.response && (
                    <div className="text-xs text-slate-400">
                      Response: <span className="text-slate-300">{result.details.response}</span>
                    </div>
                  )}
                  {result.details.usage && (
                    <div className="text-xs text-slate-400">
                      Tokens used: <span className="text-slate-300">{result.details.usage.total_tokens}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isConfigured && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded">
          <div className="text-sm text-amber-300">
            <strong>Setup Required:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-200">
              <li>Create a <code className="bg-black/30 px-1 rounded">.env</code> file in the project root</li>
              <li>Add <code className="bg-black/30 px-1 rounded">VITE_OPENAI_API_KEY=your-api-key</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
