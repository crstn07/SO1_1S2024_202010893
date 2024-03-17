#include <linux/module.h>
// para usar KERN_INFO
#include <linux/kernel.h>
//Header para los macros module_init y module_exit
#include <linux/init.h>
//Header necesario porque se usara proc_fs
#include <linux/proc_fs.h>
/* for copy_from_user */
#include <asm/uaccess.h>	
/* Header para usar la lib seq_file y manejar el archivo en /proc*/
#include <linux/seq_file.h>

// PARA CPU
#include <linux/sched.h>
#include <linux/sched/signal.h>
#include <linux/mm.h>
#include <linux/mman.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Modulo de CPU");
MODULE_AUTHOR("Cristian Daniel Pereira Tezagüic");


static int escribir_archivo(struct seq_file *archivo, void *v)
{   
    struct task_struct *task;
    unsigned int total_time = 0;
    
    
    seq_printf(archivo, "{\"Procesos\":[{}");
    //Iterar sobre todos los procesos utilizando la macro for_each_process()
    rcu_read_lock();
    for_each_process(task) {
        seq_printf(archivo,"    ,{\"PID\": %d,\n", task->pid);
        seq_printf(archivo,"    \"Nombre\": \"%s\",\n", task->comm);
        seq_printf(archivo,"    \"Estado\": %d,\n", task->stats);

        seq_printf(archivo,"    \"Usuario\": %d,\n",  task->cred->uid.val);

        unsigned long total_mem = 0;  
        unsigned long mem_used = 0;
        unsigned int mem_percent = 0;

        struct sysinfo sys_info;
        si_meminfo(&sys_info);
        total_mem = sys_info.totalram << (PAGE_SHIFT - 10);

        if (task->mm) {
            mem_used = task->mm->total_vm << (PAGE_SHIFT - 10);
            mem_percent = (mem_used * 100) / total_mem;
        }

        seq_printf(archivo,"    \"RAM\": %d,\n", mem_percent);
        
        // Iterar sobre los hijos del proceso actual utilizando la lista children
        seq_printf(archivo, "    \"Hijos\":[{}");
        struct task_struct *child_task;
        list_for_each_entry(child_task, &task->children, sibling) {
            seq_printf(archivo,"            ,{\"PID\": %d,\n", child_task->pid);
            seq_printf(archivo,"            \"Nombre\": \"%s\",\n", child_task->comm);
            seq_printf(archivo,"            \"Estado\": %llu}\n", child_task->stats);
        }
        seq_printf(archivo, "             ]\n    }\n");
        total_time += task->utime + task->stime;
    }
    rcu_read_unlock();

    seq_printf(archivo, "\n     ],\n");
    
    int cpu_usage = (total_time * 100UL) / jiffies;

    seq_printf(archivo, "\"CPU\": %d\n}", cpu_usage);
    return 0;
}

//Funcion que se ejecuta cuando se le hace un cat al modulo.
static int al_abrir(struct inode *inode, struct file *file)
{
    return single_open(file, escribir_archivo, NULL);
}

// Si el su Kernel es 5.6 o mayor
static struct proc_ops operaciones =
{
    .proc_open = al_abrir,
    .proc_read = seq_read
};

static int _insert(void)
{
    proc_create("cpu_202004816", 0, NULL, &operaciones);
    printk(KERN_INFO "Kevin Steve Martinez Lemus\n");
    return 0;
}

static void _remove(void)
{
    remove_proc_entry("cpu_202004816", NULL);
    printk(KERN_INFO "Primer Semestre 2023\n");
}

module_init(_insert);
module_exit(_remove);