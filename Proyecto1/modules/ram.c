#include <linux/module.h>
// para usar KERN_INFO
#include <linux/kernel.h>
//Header para los macros module_init y module_exit
#include <linux/init.h>
//Header necesario porque se usara proc_fs
#include <linux/proc_fs.h>
/* for copy_from_user */
//#include <linux/uaccess.h>
/* Header para usar la lib seq_file y manejar el archivo en /proc*/
#include <linux/seq_file.h>
/* PARA RAM */
#include <linux/sysinfo.h>
#include <linux/mm.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Modulo de RAM");
MODULE_AUTHOR("cristian Daniel Pereira Tezagüic");

static int escribir_archivo(struct seq_file *archivo, void *v)
{
    struct sysinfo si;
    long total_mem;
    long free_mem;
    long used_mem;
    int percent_used;

    si_meminfo(&si);
    total_mem = si.totalram * (long)si.mem_unit;
    free_mem = si.freeram * (long)si.mem_unit;
    used_mem = total_mem - free_mem;
    percent_used = used_mem * 100 / total_mem;

    seq_printf(archivo, "{\"RAM\": %d}", percent_used);
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
    proc_create("ram", 0, NULL, &operaciones);
    printk(KERN_INFO "Se montó modulo de RAM\n");
    return 0;
}

static void _remove(void)
{
    remove_proc_entry("rams", NULL);
    printk(KERN_INFO "Se elimino modulo de RAM\n");
}

module_init(_insert);
module_exit(_remove);