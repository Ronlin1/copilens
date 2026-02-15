import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, ChevronRight, ChevronDown, FolderTree } from 'lucide-react';

function FileTreeItem({ item, level = 0 }) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isFolder = item.type === 'folder';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder && (
          <div className="text-gray-500 dark:text-gray-400">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
        
        {isFolder ? (
          <Folder className="w-5 h-5 text-blue-500" />
        ) : (
          <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}

        <span className="flex-1 text-gray-800 dark:text-gray-200 font-medium">
          {item.name}
        </span>

        {item.size && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.size}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {isFolder && isOpen && item.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child, index) => (
              <FileTreeItem key={index} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FileExplorer({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 text-center text-gray-500 dark:text-gray-400">
        No file structure available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass p-6 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
          <FolderTree className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            File Explorer
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse repository structure
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
        {files.map((file, index) => (
          <FileTreeItem key={index} item={file} />
        ))}
      </div>
    </motion.div>
  );
}
